"use client";

import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  ReactNode,
  CSSProperties,
} from "react";
import Matter from "matter-js";
import { debounce } from "lodash";

export interface GravityProps {
  children: ReactNode;
  debug?: boolean;
  gravity?: { x: number; y: number };
  resetOnResize?: boolean;
  grabCursor?: boolean;
  addTopWall?: boolean;
  autoStart?: boolean;
}

export interface GravityRef {
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export interface MatterBodyProps {
  children: ReactNode;
  matterBodyOptions?: Matter.IBodyDefinition;
  x?: string | number;
  y?: string | number;
  angle?: number;
  bodyType?: "rectangle" | "circle";
}

const MatterBody = forwardRef<HTMLDivElement, MatterBodyProps>(
  function MatterBody(
    {
      children,
      matterBodyOptions,
      x,
      y,
      angle,
      bodyType = "rectangle",
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        data-matter-body
        data-x={x}
        data-y={y}
        data-angle={angle}
        data-body-type={bodyType}
        data-matter-body-options={JSON.stringify(matterBodyOptions || {})}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          willChange: "transform",
          userSelect: "none",
          touchAction: "none",
        }}
      >
        {children}
      </div>
    );
  }
);

MatterBody.displayName = "MatterBody";

const Gravity = forwardRef<GravityRef, GravityProps>(function Gravity(
  {
    children,
    debug = false,
    gravity = { x: 0, y: 1 },
    resetOnResize = true,
    grabCursor = true,
    addTopWall = true,
    autoStart = true,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const bodiesRef = useRef<Map<HTMLElement, Matter.Body>>(new Map());
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const initializedRef = useRef(false);

  const parsePosition = useCallback(
    (value: string | number | undefined, dimension: number): number => {
      if (value === undefined) return Math.random() * dimension;
      if (typeof value === "number") return value;
      if (value.endsWith("%")) {
        return (parseFloat(value) / 100) * dimension;
      }
      return parseFloat(value);
    },
    []
  );

  const initPhysics = useCallback(() => {
    if (initializedRef.current) return;
    
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    if (width === 0 || height === 0) return;

    initializedRef.current = true;

    
    const engine = Matter.Engine.create({
      enableSleeping: false,
    });
    engine.gravity.x = gravity.x;
    engine.gravity.y = gravity.y;
    engineRef.current = engine;

    
    const render = Matter.Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width,
        height,
        wireframes: debug,
        background: "transparent",
        pixelRatio: window.devicePixelRatio || 1,
      },
    });
    renderRef.current = render;

    
    const wallThickness = 100;
    const walls = [
      
      Matter.Bodies.rectangle(
        width / 2,
        height + wallThickness / 2,
        width + wallThickness * 2,
        wallThickness,
        { isStatic: true, label: "wall-bottom", friction: 0.3 }
      ),
      
      Matter.Bodies.rectangle(
        -wallThickness / 2,
        height / 2,
        wallThickness,
        height + wallThickness * 2,
        { isStatic: true, label: "wall-left", friction: 0.3 }
      ),
      
      Matter.Bodies.rectangle(
        width + wallThickness / 2,
        height / 2,
        wallThickness,
        height + wallThickness * 2,
        { isStatic: true, label: "wall-right", friction: 0.3 }
      ),
    ];

    if (addTopWall) {
      walls.push(
        Matter.Bodies.rectangle(
          width / 2,
          -wallThickness / 2,
          width + wallThickness * 2,
          wallThickness,
          { isStatic: true, label: "wall-top", friction: 0.3 }
        )
      );
    }

    Matter.Composite.add(engine.world, walls);

    
    const bodyElements = container.querySelectorAll("[data-matter-body]");
    bodyElements.forEach((el) => {
      const element = el as HTMLElement;
      const rect = element.getBoundingClientRect();

      const elWidth = rect.width || 50;
      const elHeight = rect.height || 50;

      const dataX = element.dataset.x;
      const dataY = element.dataset.y;
      const dataAngle = element.dataset.angle;
      const bodyType = element.dataset.bodyType || "rectangle";
      const matterOptions = JSON.parse(
        element.dataset.matterBodyOptions || "{}"
      );

      const x = parsePosition(dataX, width);
      const y = parsePosition(dataY, height);
      const angle = dataAngle ? parseFloat(dataAngle) : 0;

      let body: Matter.Body;

      if (bodyType === "circle") {
        const radius = Math.max(elWidth, elHeight) / 2;
        body = Matter.Bodies.circle(x, y, radius, {
          angle,
          restitution: 0.5,
          friction: 0.3,
          frictionAir: 0.01,
          ...matterOptions,
        });
      } else {
        body = Matter.Bodies.rectangle(x, y, elWidth, elHeight, {
          angle,
          restitution: 0.5,
          friction: 0.3,
          frictionAir: 0.01,
          ...matterOptions,
        });
      }

      Matter.Composite.add(engine.world, body);
      bodiesRef.current.set(element, body);
    });

    
    const mouse = Matter.Mouse.create(canvas);
    mouse.pixelRatio = window.devicePixelRatio || 1;

    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: debug },
      },
    });
    mouseConstraintRef.current = mouseConstraint;
    Matter.Composite.add(engine.world, mouseConstraint);

    
    render.mouse = mouse;

    
    Matter.Events.on(mouseConstraint, "startdrag", () => {
      setIsGrabbing(true);
    });

    Matter.Events.on(mouseConstraint, "enddrag", () => {
      setIsGrabbing(false);
    });

    
    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    if (autoStart) {
      Matter.Runner.run(runner, engine);
      if (debug) {
        Matter.Render.run(render);
      }
    }

    
    const updateDOM = () => {
      bodiesRef.current.forEach((body, element) => {
        const { x, y } = body.position;
        const angle = body.angle;
        const elWidth = element.offsetWidth || 50;
        const elHeight = element.offsetHeight || 50;

        element.style.transform = `translate(${x - elWidth / 2}px, ${y - elHeight / 2}px) rotate(${angle}rad)`;
      });

      frameIdRef.current = requestAnimationFrame(updateDOM);
    };

    frameIdRef.current = requestAnimationFrame(updateDOM);
  }, [gravity, addTopWall, autoStart, parsePosition, debug]);

  const cleanup = useCallback(() => {
    initializedRef.current = false;

    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }

    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
      runnerRef.current = null;
    }

    if (renderRef.current) {
      Matter.Render.stop(renderRef.current);
      renderRef.current = null;
    }

    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
      Matter.Composite.clear(engineRef.current.world, false);
      engineRef.current = null;
    }

    bodiesRef.current.clear();
    mouseConstraintRef.current = null;
  }, []);

  const reset = useCallback(() => {
    cleanup();
    requestAnimationFrame(() => {
      initPhysics();
    });
  }, [cleanup, initPhysics]);

  useImperativeHandle(
    ref,
    () => ({
      start: () => {
        if (runnerRef.current && engineRef.current) {
          Matter.Runner.run(runnerRef.current, engineRef.current);
        }
      },
      stop: () => {
        if (runnerRef.current) {
          Matter.Runner.stop(runnerRef.current);
        }
      },
      reset,
    }),
    [reset]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      initPhysics();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [initPhysics, cleanup]);

  useEffect(() => {
    if (!resetOnResize) return;

    const debouncedReset = debounce(reset, 500);
    window.addEventListener("resize", debouncedReset);
    return () => {
      window.removeEventListener("resize", debouncedReset);
      debouncedReset.cancel();
    };
  }, [resetOnResize, reset]);

  const containerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  };

  const canvasStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    cursor: grabCursor ? (isGrabbing ? "grabbing" : "grab") : "default",
    
    opacity: debug ? 1 : 0,
    zIndex: 100,
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <canvas ref={canvasRef} style={canvasStyle} />
      {children}
    </div>
  );
});

Gravity.displayName = "Gravity";

export { Gravity, MatterBody };
