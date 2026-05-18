import { useEffect, useRef } from "react";

import { CartDrawer } from "../cart/CartDrawer.js";
import { LangSelect } from "./LangSelect.js";
import { clp } from "../../lib/format.js";

export function StoreLayout({
  cart,
  cartOpen,
  changeLang,
  checkout,
  children,
  lang,
  logout,
  removeCart,
  router,
  setCartOpen,
  t,
  user,
}) {
  const headerRef = useRef(null);
  const shaderCanvasRef = useRef(null);
  const shaderMouseRef = useRef({ x: 0.5, y: 0.5 });
  const shaderTrailRef = useRef([
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.5 },
  ]);

  useEffect(() => {
    const canvas = shaderCanvasRef.current;

    if (!canvas) return undefined;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: false });

    if (!gl) return undefined;

    const vertexSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision highp float;

      uniform vec2 resolution;
      uniform vec2 mouse;
      uniform vec2 trailA;
      uniform vec2 trailB;
      uniform vec2 trailC;
      uniform float time;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amp = 0.5;
        mat2 rot = mat2(0.82, -0.57, 0.57, 0.82);

        for (int i = 0; i < 5; i++) {
          value += amp * noise(p);
          p = rot * p * 2.04 + 0.17;
          amp *= 0.52;
        }

        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = uv;
        p.x *= resolution.x / resolution.y;

        vec2 m = mouse;
        m.x *= resolution.x / resolution.y;
        vec2 ta = trailA;
        vec2 tb = trailB;
        vec2 tc = trailC;
        ta.x *= resolution.x / resolution.y;
        tb.x *= resolution.x / resolution.y;
        tc.x *= resolution.x / resolution.y;

        float cursor = exp(-distance(p, m) * 4.4);
        float trail =
          exp(-distance(p, ta) * 3.2) * 0.52 +
          exp(-distance(p, tb) * 2.4) * 0.36 +
          exp(-distance(p, tc) * 1.8) * 0.26;

        vec2 flow = p * 2.0;
        flow += 0.18 * vec2(
          sin(time * 0.37 + p.y * 5.0),
          cos(time * 0.31 + p.x * 4.0)
        );
        flow += cursor * 0.28 + trail * 0.22;

        float field = fbm(flow + vec2(time * 0.035, -time * 0.025));
        field += 0.35 * fbm(flow * 2.2 - vec2(time * 0.07, time * 0.05));

        float contour = smoothstep(0.47, 0.56, field) - smoothstep(0.63, 0.72, field);
        float bloom = smoothstep(0.52, 1.02, field + cursor * 0.28 + trail * 0.22);
        float vignette = smoothstep(0.96, 0.2, distance(uv, vec2(0.5)));

        vec3 base = vec3(0.16, 0.125, 0.112);
        vec3 rose = vec3(0.78, 0.52, 0.47);
        vec3 sage = vec3(0.66, 0.76, 0.52);
        vec3 cream = vec3(1.0, 0.9, 0.82);

        vec3 color = base;
        color = mix(color, rose, smoothstep(0.2, 0.86, field) * 0.48);
        color = mix(color, sage, smoothstep(0.36, 1.0, fbm(flow * 1.15 + 4.0)) * 0.34);
        color += cream * contour * 0.045;
        color += cream * bloom * (0.07 + cursor * 0.1 + trail * 0.16);
        color += vec3(0.08, 0.064, 0.052);
        color *= 0.82 + vignette * 0.34;

        gl_FragColor = vec4(color, 0.9);
      }
    `;

    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolution = gl.getUniformLocation(program, "resolution");
    const mouse = gl.getUniformLocation(program, "mouse");
    const trailA = gl.getUniformLocation(program, "trailA");
    const trailB = gl.getUniformLocation(program, "trailB");
    const trailC = gl.getUniformLocation(program, "trailC");
    const time = gl.getUniformLocation(program, "time");
    let frame = 0;

    function resize() {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas.clientWidth * scale));
      const height = Math.max(1, Math.floor(canvas.clientHeight * scale));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    function render(now) {
      resize();
      const [a, b, c] = shaderTrailRef.current;
      const target = shaderMouseRef.current;

      a.x += (target.x - a.x) * 0.15;
      a.y += (target.y - a.y) * 0.15;
      b.x += (a.x - b.x) * 0.08;
      b.y += (a.y - b.y) * 0.08;
      c.x += (b.x - c.x) * 0.045;
      c.y += (b.y - c.y) * 0.045;

      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(mouse, shaderMouseRef.current.x, shaderMouseRef.current.y);
      gl.uniform2f(trailA, a.x, a.y);
      gl.uniform2f(trailB, b.x, b.y);
      gl.uniform2f(trailC, c.x, c.y);
      gl.uniform1f(time, now * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frame = requestAnimationFrame(render);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  function moveHeaderLight(event) {
    const header = headerRef.current;

    if (!header) return;

    const rect = header.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    shaderMouseRef.current = {
      x: x / rect.width,
      y: 1 - y / rect.height,
    };
    header.style.setProperty("--cursor-x", `${event.clientX - rect.left}px`);
    header.style.setProperty("--cursor-y", `${event.clientY - rect.top}px`);
  }

  function resetHeaderLight() {
    const header = headerRef.current;

    if (!header) return;

    header.style.setProperty("--cursor-x", "50%");
    header.style.setProperty("--cursor-y", "50%");
    shaderMouseRef.current = { x: 0.5, y: 0.5 };
  }

  return (
    <>
      <div className="announce">
        {t("announce")} {clp(4500000)} {lang === "ru" ? "по Чили" : lang === "pt" ? "no Chile" : "in Chile"}
      </div>
      <header className="topbar" ref={headerRef} onPointerMove={moveHeaderLight} onPointerLeave={resetHeaderLight}>
        <canvas className="header-canvas" ref={shaderCanvasRef} aria-hidden="true" />
        <span className="header-lines" aria-hidden="true" />
        <nav>
          <button className="nav-button" onClick={() => router.push("/catalog")}>{t("catalog")}</button>
          <button className="nav-button" onClick={() => router.push("/orders")}>{t("orders")}</button>
          {user?.role === "admin" && <button className="nav-button" onClick={() => router.push("/admin")}>{t("adminPanel")}</button>}
        </nav>
        <button className="brand shader-brand" onClick={() => router.push("/")} aria-label="LUME">
          <span aria-hidden="true">LUME</span>
        </button>
        <div className="actions">
          {user && <span className="user">{user.email}</span>}
          <div className="header-tools">
            <LangSelect lang={lang} changeLang={changeLang} />
            {user ? (
              <button className="tool-button" type="button" onClick={logout} aria-label={t("logout")} title={t("logout")}>
                <span className="logout-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32" focusable="false">
                    <path d="M13 7H7.5v18H13" />
                    <path d="M14.5 16h11" />
                    <path d="M21.5 11.5 26 16l-4.5 4.5" />
                  </svg>
                </span>
              </button>
            ) : (
              <button className="tool-button" type="button" onClick={() => router.push("/auth")} aria-label={t("login")} title={t("login")}>
                <span className="logout-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32" focusable="false">
                    <path d="M19 7h5.5v18H19" />
                    <path d="M6.5 16h11" />
                    <path d="M13.5 11.5 18 16l-4.5 4.5" />
                  </svg>
                </span>
              </button>
            )}
            <button className="tool-button cart-tool" type="button" onClick={() => setCartOpen(true)} aria-label={t("bag")} title={t("bag")}>
              <span className="bag-icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" focusable="false">
                  <path d="M8.2 11.3h15.6l1.5 15.2H6.7l1.5-15.2Z" />
                  <path d="M11.6 11.1V8.8a4.4 4.4 0 0 1 8.8 0v2.3" />
                  <path d="M11.6 13.1v.1" />
                  <path d="M20.4 13.1v.1" />
                </svg>
              </span>
              <strong>{cart.items.length}</strong>
            </button>
          </div>
        </div>
      </header>
      {children}
      <CartDrawer cart={cart} cartOpen={cartOpen} setCartOpen={setCartOpen} t={t} removeCart={removeCart} checkout={checkout} user={user} />
    </>
  );
}
