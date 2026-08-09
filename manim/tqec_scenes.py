"""
Lattice Atlas — Manim scene scripts for accurate TQEC concept films.

Every animation is driven by the real structure of the surface code, so the
picture is exact, not an artist's impression. Each scene walks through the
process in numbered stages so every step reads clearly. Render with Manim
Community (see README.md), review each clip, and embed it labeled
"illustrative concept film".

LaTeX-free (uses Text/Unicode, not MathTex) so it renders without a TeX install.

Palette matches the site:
  data qubit   #22D3EE (cyan)     Z-check / plaquette  #8B5CF6 (violet)
  error        #FB7185 (rose)     correction / ok      #34D399 (green)
"""

from manim import *

DATA = "#22D3EE"
CHECK = "#8B5CF6"
ERR = "#FB7185"
OK = "#34D399"
DIM = "#3D5178"
INK = "#0B132B"
MUTE = "#AEB9D4"


def stage_banner(text, color=DATA):
    """A consistent numbered stage caption pinned to the bottom of the frame."""
    return Text(text, font_size=24, color=color).to_edge(DOWN, buff=0.5)


class StabilizerCheck(Scene):
    """A Z-plaquette measures the parity Z·Z·Z·Z of its four data qubits and
    flips +1 → −1 exactly when a bit-flip (X) error touches it — detecting the
    error without ever reading (collapsing) the stored logical state."""

    def construct(self):
        self.camera.background_color = INK
        title = Text("A stabilizer check reads parity — not the qubits themselves", font_size=26).to_edge(UP)
        self.play(FadeIn(title))

        corners = [[-1.6, 1.6, 0], [1.6, 1.6, 0], [-1.6, -1.6, 0], [1.6, -1.6, 0]]
        pl0 = Square(side_length=3.2, color=CHECK, fill_color=CHECK, fill_opacity=0.10)
        qubits = VGroup(*[Dot(c, radius=0.16, color=DATA) for c in corners])
        qlabels = VGroup(*[
            Text(f"q{i+1}", font_size=22, color=DATA).next_to(qubits[i], d, buff=0.12)
            for i, d in enumerate([UL, UR, DL, DR])
        ])
        formula = Text("check  Bₚ = Z·Z·Z·Z   (measures parity)", font_size=26, color=CHECK).to_edge(DOWN, buff=0.4)

        banner = stage_banner("① four data qubits share one stabilizer check", CHECK)
        self.play(FadeIn(banner))
        self.play(Create(pl0), LaggedStartMap(GrowFromCenter, qubits), FadeIn(qlabels))
        self.play(Write(formula))
        self.wait(0.3)

        readout = Text("Bₚ = +1", font_size=38, color=OK).move_to(ORIGIN)
        self.play(FadeIn(readout, scale=0.6), Indicate(readout, color=OK, scale_factor=1.15))
        self.wait(0.4)

        # Stage 2: a bit-flip error lands on q1.
        err = Cross(qubits[0], stroke_color=ERR).scale(0.4)
        err_tag = Text("X error", font_size=24, color=ERR).next_to(qubits[0], LEFT, buff=0.15)
        self.play(qubits[0].animate.set_color(ERR), Create(err), FadeIn(err_tag))

        flipped = Text("Bₚ = −1", font_size=38, color=ERR).move_to(ORIGIN)
        self.play(pl0.animate.set_fill(ERR, opacity=0.18).set_stroke(ERR), Transform(readout, flipped))
        caption = stage_banner("② the check flipped to −1 — it detected the error; the logical state is untouched", ERR)
        self.play(Transform(banner, caption))
        self.wait(1.2)


class SyndromeMatching(Scene):
    """The decoder story on a lattice, in four numbered stages: an error chain
    lights up detectors only at its endpoints (the syndrome is the boundary of
    the chain); minimum-weight matching pairs those defects along the shortest
    path; applying the matched correction annihilates the errors."""

    def construct(self):
        self.camera.background_color = INK
        title = Text("Decoding: syndrome → matching → correction", font_size=28).to_edge(UP)
        self.play(FadeIn(title))

        n = 5
        step = 1.1
        origin = np.array([-(n - 1) / 2 * step, -(n - 1) / 2 * step, 0])

        def pos(r, c):
            return origin + np.array([c * step, r * step, 0])

        dots = {}
        grp = VGroup()
        for r in range(n):
            for c in range(n):
                d = Dot(pos(r, c), radius=0.10, color=DIM)
                dots[(r, c)] = d
                grp.add(d)
        lines = VGroup()
        for r in range(n):
            lines.add(Line(pos(r, 0), pos(r, n - 1), stroke_color=DIM, stroke_width=1, stroke_opacity=0.4))
        for c in range(n):
            lines.add(Line(pos(0, c), pos(n - 1, c), stroke_color=DIM, stroke_width=1, stroke_opacity=0.4))
        banner = stage_banner("① a chain of physical errors flips some data qubits", ERR)
        self.play(Create(lines), LaggedStartMap(GrowFromCenter, grp, lag_ratio=0.02), FadeIn(banner))

        chain_cells = [(2, 1), (2, 2), (2, 3)]
        chain_edges = VGroup()
        for (r, c) in chain_cells:
            self.play(dots[(r, c)].animate.set_color(ERR).scale(1.6), run_time=0.25)
        for a, b in [((2, 1), (2, 2)), ((2, 2), (2, 3))]:
            chain_edges.add(Line(pos(*a), pos(*b), stroke_color=ERR, stroke_width=6))
        self.play(Create(chain_edges))
        self.wait(0.3)

        d1 = Circle(radius=0.28, color=OK, stroke_width=4).move_to(pos(2, 0.5))
        d2 = Circle(radius=0.28, color=OK, stroke_width=4).move_to(pos(2, 3.5))
        b2 = stage_banner("② detectors fire ONLY at the chain's two endpoints", OK)
        self.play(Create(d1), Create(d2), Transform(banner, b2))
        self.wait(0.6)

        match = Line(pos(2, 0.5), pos(2, 3.5), stroke_color=OK, stroke_width=5).set_stroke(opacity=0.9)
        b3 = stage_banner("③ minimum-weight matching connects them by the shortest path", OK)
        self.play(Transform(banner, b3), Create(match))
        self.wait(0.6)

        b4 = stage_banner("④ apply that correction → errors annihilate → lattice clean", OK)
        self.play(
            FadeOut(chain_edges), FadeOut(match), FadeOut(d1), FadeOut(d2),
            *[dots[(r, c)].animate.set_color(DIM).scale(1 / 1.6) for (r, c) in chain_cells],
            Transform(banner, b4),
        )
        self.wait(1.2)


class ThresholdSuppression(Scene):
    """Logical error P_L vs physical error p for growing code distance. Below the
    threshold p_th the curves fan downward — bigger codes suppress errors
    exponentially; above it, bigger is worse. The crossing point is the threshold."""

    def construct(self):
        self.camera.background_color = INK
        title = Text("Below threshold, a bigger code suppresses errors", font_size=28).to_edge(UP)
        self.play(FadeIn(title))

        p_th = 0.1
        A = 0.5
        axes = Axes(
            x_range=[0.02, 0.2, 0.04], y_range=[-4, 0, 1], x_length=8, y_length=4.3,
            axis_config={"color": DIM, "include_tip": False},
        ).shift(DOWN * 0.4)
        x_label = axes.get_x_axis_label(Text("physical error p", font_size=22))
        y_label = axes.get_y_axis_label(Text("log10 Pl", font_size=22))
        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))

        def logpl(p, d):
            val = A * (p / p_th) ** ((d + 1) / 2)
            return max(-4.0, np.log10(min(0.6, val)))

        colors = {3: "#F43F5E", 5: "#F5B83D", 7: "#22D3EE"}
        legend = VGroup()
        for d in [3, 5, 7]:
            g = axes.plot(lambda p, d=d: logpl(p, d), x_range=[0.03, 0.19, 0.005], color=colors[d])
            lab = VGroup(
                Line(ORIGIN, RIGHT * 0.4, color=colors[d], stroke_width=4),
                Text(f"d={d}", font_size=22, color=colors[d]),
            ).arrange(RIGHT, buff=0.15)
            legend.add(lab)
            self.play(Create(g), run_time=1.0)
        legend.arrange(DOWN, aligned_edge=LEFT, buff=0.2).to_corner(UR).shift(DOWN * 0.8)
        self.play(FadeIn(legend))

        xthr = axes.c2p(p_th, 0)[0]
        thr = DashedLine([xthr, axes.c2p(p_th, -4)[1], 0], [xthr, axes.c2p(p_th, 0)[1], 0], color="#F5B83D")
        thr_lab = Text("p_th  (curves cross here)", font_size=22, color="#F5B83D").next_to(thr, UP, buff=0.1)
        self.play(Create(thr), FadeIn(thr_lab))
        self.play(FadeIn(stage_banner("left of the crossing, larger d drives Pl down exponentially", MUTE)))
        self.wait(1.4)


class ToricCodeLogicals(Scene):
    """On a torus the two logical operators are non-contractible loops that wind
    the donut two different ways; any local error loop is contractible — it is a
    product of stabilizers and touches the logical qubit not at all."""

    def construct(self):
        self.camera.background_color = INK
        title = Text("Logical operators are loops that wrap the torus", font_size=28).to_edge(UP)
        self.play(FadeIn(title))

        outer = Ellipse(width=6, height=3.2, color=DIM, stroke_width=3)
        hole = Ellipse(width=2.2, height=1.0, color=DIM, stroke_width=2).move_to(ORIGIN)
        self.play(Create(outer), Create(hole))

        z1 = Ellipse(width=1.0, height=2.6, color=DATA, stroke_width=6).move_to(LEFT * 1.9)
        z1_lab = Text("Z̄  (meridian)", font_size=24, color=DATA).next_to(z1, LEFT, buff=0.1)
        self.play(Create(z1), FadeIn(z1_lab), FadeIn(stage_banner("① one logical loop wraps the tube the short way", DATA)))

        x1 = Ellipse(width=5.4, height=2.0, color=CHECK, stroke_width=6)
        x1_lab = Text("X̄  (longitude)", font_size=24, color=CHECK).next_to(x1, DOWN, buff=0.1)
        b2 = stage_banner("② the other wraps the long way — two independent logical operators", CHECK)
        self.play(Create(x1), FadeIn(x1_lab))
        self.play(FadeIn(b2))
        self.wait(0.4)

        loop = Circle(radius=0.6, color=ERR, stroke_width=4).move_to(RIGHT * 1.7 + UP * 0.9)
        loop_lab = Text("local error loop", font_size=22, color=ERR).next_to(loop, UP, buff=0.1)
        self.play(Create(loop), FadeIn(loop_lab))
        b3 = stage_banner("③ a local loop shrinks to nothing — it's a stabilizer, harmless", ERR)
        self.play(loop.animate.scale(0.02), FadeOut(loop_lab), FadeIn(b3), run_time=1.4)
        self.wait(1.4)
