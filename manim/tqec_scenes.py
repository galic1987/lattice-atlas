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
    return Text(text, font_size=20, color=color).to_edge(DOWN, buff=0.35)


class StabilizerCheck(Scene):
    """A Z-plaquette measures the parity Z·Z·Z·Z of its four data qubits and
    flips +1 → −1 exactly when a bit-flip (X) error touches it — detecting the
    error without ever reading (collapsing) the stored logical state."""

    def construct(self):
        self.camera.background_color = INK
        title = Text("A stabilizer check reads parity — not the qubits themselves", font_size=24).to_edge(UP, buff=0.4)
        self.play(FadeIn(title))

        corners = [[-1.6, 1.4, 0], [1.6, 1.4, 0], [-1.6, -1.4, 0], [1.6, -1.4, 0]]
        pl0 = Square(side_length=3.0, color=CHECK, fill_color=CHECK, fill_opacity=0.10)
        qubits = VGroup(*[Dot(c, radius=0.16, color=DATA) for c in corners])
        qlabels = VGroup(*[
            Text(f"q{i+1}", font_size=20, color=DATA).next_to(qubits[i], d, buff=0.14)
            for i, d in enumerate([UL, UR, DL, DR])
        ])

        banner = stage_banner("① four data qubits share one stabilizer check", CHECK)
        self.play(FadeIn(banner))
        self.play(Create(pl0), LaggedStartMap(GrowFromCenter, qubits), FadeIn(qlabels))
        self.wait(0.4)

        readout = Text("Bₚ = +1", font_size=36, color=OK).move_to(ORIGIN)
        self.play(FadeIn(readout, scale=0.6), Indicate(readout, color=OK, scale_factor=1.15))
        self.wait(0.5)

        # Stage 2: a bit-flip error lands on q1.
        err = Cross(qubits[0], stroke_color=ERR).scale(0.35)
        err_tag = Text("X error", font_size=20, color=ERR).next_to(qubits[0], LEFT, buff=0.15)
        self.play(qubits[0].animate.set_color(ERR), Create(err), FadeIn(err_tag))

        flipped = Text("Bₚ = −1", font_size=36, color=ERR).move_to(ORIGIN)
        self.play(pl0.animate.set_fill(ERR, opacity=0.20).set_stroke(ERR), Transform(readout, flipped))
        caption = stage_banner("② check flipped to −1 — error detected without collapsing logical state", ERR)
        self.play(Transform(banner, caption))
        self.wait(1.4)


class SyndromeMatching(Scene):
    """The decoder story on a lattice, in four numbered stages: an error chain
    lights up detectors only at its endpoints (the syndrome is the boundary of
    the chain); minimum-weight matching pairs those defects along the shortest
    path; applying the matched correction annihilates the errors."""

    def construct(self):
        self.camera.background_color = INK
        title = Text("Decoding: syndrome → matching → correction", font_size=26).to_edge(UP, buff=0.4)
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
            self.play(dots[(r, c)].animate.set_color(ERR).scale(1.5), run_time=0.20)
        for a, b in [((2, 1), (2, 2)), ((2, 2), (2, 3))]:
            chain_edges.add(Line(pos(*a), pos(*b), stroke_color=ERR, stroke_width=5))
        self.play(Create(chain_edges))
        self.wait(0.3)

        d1 = Circle(radius=0.26, color=OK, stroke_width=3.5).move_to(pos(2, 0.5))
        d2 = Circle(radius=0.26, color=OK, stroke_width=3.5).move_to(pos(2, 3.5))
        b2 = stage_banner("② detectors fire ONLY at the chain's two endpoints", OK)
        self.play(Create(d1), Create(d2), Transform(banner, b2))
        self.wait(0.5)

        match = Line(pos(2, 0.5), pos(2, 3.5), stroke_color=OK, stroke_width=4).set_stroke(opacity=0.9)
        w_lbl = Text("w = -ln(p/(1-p))", font_size=16, color=OK).next_to(match, UP, buff=0.1)
        b3 = stage_banner("③ minimum-weight matching connects them by shortest path", OK)
        self.play(Transform(banner, b3), Create(match), FadeIn(w_lbl))
        self.wait(0.6)

        b4 = stage_banner("④ apply that correction → errors annihilate → lattice clean", OK)
        self.play(
            FadeOut(chain_edges), FadeOut(match), FadeOut(d1), FadeOut(d2), FadeOut(w_lbl),
            *[dots[(r, c)].animate.set_color(DIM).scale(1 / 1.5) for (r, c) in chain_cells],
            Transform(banner, b4),
        )
        self.wait(1.4)


class ThresholdSuppression(Scene):
    """Logical error P_L vs physical error p for growing code distance."""

    def construct(self):
        self.camera.background_color = INK
        title = Text("Below threshold, a bigger code suppresses errors", font_size=26).to_edge(UP, buff=0.4)
        self.play(FadeIn(title))

        p_th = 0.1
        # Crossing logical error at threshold (all distances meet here). Kept well
        # below the 0.5 saturation so the curves have room to both suppress (below
        # p_th) and diverge upward (above p_th) instead of pinning to a flat cap.
        A = 0.1
        axes = Axes(
            x_range=[0.02, 0.2, 0.04], y_range=[-4, 0, 1], x_length=7.5, y_length=4.0,
            axis_config={"color": DIM, "include_tip": False},
        ).shift(DOWN * 0.3)
        x_label = Text("physical error p", font_size=20, color=MUTE).next_to(axes, DOWN, buff=0.2)
        y_label = axes.get_y_axis_label(Text("log10 Pl", font_size=20, color=MUTE))
        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label))

        def logpl(p, d):
            # P_L ~ A (p/p_th)^((d+1)/2): below p_th larger d suppresses harder,
            # above p_th larger d is WORSE. Saturate at 0.5 (a logical coin flip),
            # floor at 1e-4 for the plot window.
            val = A * (p / p_th) ** ((d + 1) / 2)
            return max(-4.0, np.log10(min(0.5, val)))

        colors = {3: "#F43F5E", 5: "#F5B83D", 7: "#22D3EE"}

        legend = VGroup()
        for d in [3, 5, 7]:
            # Plot through p_th into the above-threshold regime so the reversal shows.
            g = axes.plot(lambda p, d=d: logpl(p, d), x_range=[0.03, 0.16, 0.004], color=colors[d])
            lab = VGroup(
                Line(ORIGIN, RIGHT * 0.35, color=colors[d], stroke_width=3),
                Text(f"d={d}", font_size=20, color=colors[d]),
            ).arrange(RIGHT, buff=0.12)
            legend.add(lab)
            self.play(Create(g), run_time=0.8)
        # Upper-left corner is empty (curves live at the bottom for small p), so the
        # legend sits clear of both the rising curves and the bottom axis caption.
        legend.arrange(DOWN, aligned_edge=LEFT, buff=0.15).to_corner(UL).shift(DOWN * 1.2 + RIGHT * 0.35)
        self.play(FadeIn(legend))

        xthr = axes.c2p(p_th, 0)[0]
        thr = DashedLine([xthr, axes.c2p(p_th, -4)[1], 0], [xthr, axes.c2p(p_th, 0)[1], 0], color="#F5B83D")
        thr_lab = Text("p_th", font_size=20, color="#F5B83D").next_to(thr, UP, buff=0.1)
        self.play(Create(thr), FadeIn(thr_lab))

        banner = stage_banner("left of the crossing, larger d drives Pl down exponentially", MUTE)
        self.play(FadeIn(banner))
        self.wait(1.5)
        # The reversal above threshold is the whole point — call it out explicitly.
        banner2 = stage_banner("right of the crossing, larger d is WORSE — noise outruns correction", "#F43F5E")
        self.play(Transform(banner, banner2))
        self.wait(1.5)


class ToricCodeLogicals(Scene):
    """On a torus the two logical operators are non-contractible loops."""

    def construct(self):
        self.camera.background_color = INK
        title = Text("Logical operators are loops that wrap the torus", font_size=26).to_edge(UP, buff=0.4)
        self.play(FadeIn(title))

        outer = Ellipse(width=5.8, height=3.0, color=DIM, stroke_width=2.5)
        hole = Ellipse(width=2.0, height=0.9, color=DIM, stroke_width=2).move_to(ORIGIN)
        self.play(Create(outer), Create(hole))

        z1 = Ellipse(width=0.9, height=2.4, color=DATA, stroke_width=5).move_to(LEFT * 1.8)
        z1_lab = Text("Z̄  (meridian)", font_size=20, color=DATA).next_to(z1, LEFT, buff=0.1)
        # One banner, transformed through the three beats — so they never stack.
        banner = stage_banner("① one logical loop wraps the tube the short way", DATA)
        self.play(Create(z1), FadeIn(z1_lab), FadeIn(banner))

        x1 = Ellipse(width=5.2, height=1.8, color=CHECK, stroke_width=5)
        x1_lab = Text("X̄  (longitude)", font_size=20, color=CHECK).next_to(x1, DOWN, buff=0.1)
        b2 = stage_banner("② the other wraps the long way — two independent logical operators", CHECK)
        self.play(Create(x1), FadeIn(x1_lab))
        self.play(Transform(banner, b2))
        self.wait(0.4)

        loop = Circle(radius=0.5, color=ERR, stroke_width=3.5).move_to(RIGHT * 1.6 + UP * 0.8)
        loop_lab = Text("local error loop", font_size=20, color=ERR).next_to(loop, UP, buff=0.1)
        self.play(Create(loop), FadeIn(loop_lab))
        b3 = stage_banner("③ a local loop shrinks to nothing — it's a stabilizer, harmless", ERR)
        self.play(loop.animate.scale(0.02), FadeOut(loop_lab), Transform(banner, b3), run_time=1.2)
        self.wait(1.5)


class LatticeSurgery(Scene):
    """Two surface-code patches merge along their facing smooth Z-boundaries to
    measure the joint parity Z_L1 · Z_L2, then split — the move that (with
    single-patch operations) realises a logical CNOT without moving any qubit.
    Schematic of the protocol's structure, not a full stabilizer simulation."""

    def construct(self):
        self.camera.background_color = INK
        title = Text("Lattice surgery: merge → measure joint parity → split", font_size=24).to_edge(UP, buff=0.4)
        self.play(FadeIn(title))

        def patch(cx, label, color):
            body = RoundedRectangle(
                width=2.4, height=2.4, corner_radius=0.12,
                stroke_color=color, fill_color="#0f172a", fill_opacity=1.0, stroke_width=2.5,
            ).move_to([cx, -0.2, 0])
            dots = VGroup(*[
                Dot([cx + i * 0.6 - 0.6, -0.2 + j * 0.6 - 0.6, 0], radius=0.07, color=color)
                for i in range(3) for j in range(3)
            ])
            lab = Text(label, font_size=20, color=color).next_to(body, UP, buff=0.12)
            return VGroup(body, dots, lab)

        pA = patch(-2.0, "Q_A  |ψ⟩", DATA)
        pB = patch(2.0, "Q_B  |+⟩", OK)
        banner = stage_banner("① two logical patches, facing smooth Z-boundaries", DATA)
        self.play(FadeIn(pA), FadeIn(pB), FadeIn(banner))
        self.wait(0.4)

        # Highlight the two facing smooth Z-boundaries (inner edges of each patch).
        bA = Line([-0.8, -1.4, 0], [-0.8, 1.0, 0], color=CHECK, stroke_width=6)
        bB = Line([0.8, -1.4, 0], [0.8, 1.0, 0], color=CHECK, stroke_width=6)
        self.play(Create(bA), Create(bB))
        self.wait(0.3)

        # ② MERGE: a seam of joint Z-checks welds the boundary and measures Z_L1·Z_L2.
        seam = RoundedRectangle(
            width=1.6, height=2.4, corner_radius=0.08,
            stroke_color=CHECK, fill_color=CHECK, fill_opacity=0.22, stroke_width=2.5,
        ).move_to([0, -0.2, 0]).set_stroke(opacity=0.9)
        joint = Text("measure  Z_L1 · Z_L2", font_size=22, color=CHECK).move_to([0, 1.55, 0])
        b2 = stage_banner("② merge the boundary → measure the JOINT parity Z_L1 · Z_L2", CHECK)
        self.play(FadeOut(bA), FadeOut(bB), FadeIn(seam), Transform(banner, b2))
        self.play(Write(joint))
        self.wait(0.5)

        # ③ The outcome is a single classical parity bit; both patches stay encoded.
        outcome = Text("outcome = ±1  (one classical bit)", font_size=22, color=OK).move_to([0, 1.55, 0])
        b3 = stage_banner("③ the result is a single parity bit — the patches stay encoded", OK)
        self.play(Transform(joint, outcome), seam.animate.set_stroke(OK).set_fill(OK, opacity=0.15), Transform(banner, b3))
        self.wait(0.5)

        # ④ SPLIT back — with single-patch ops this whole move is a logical CNOT.
        b4 = stage_banner("④ split back → with single-patch ops this is a logical CNOT (no qubit moved)", OK)
        self.play(FadeOut(seam), FadeOut(joint), Transform(banner, b4))
        self.wait(1.5)


class QuantumLdpcBipartite(Scene):
    """Belief propagation on a sparse bipartite Tanner graph: qubit (variable)
    nodes at top, parity checks at bottom, sparse edges. An error fires the checks
    that touch it; log-likelihood messages pass along the edges until the qubit's
    marginal flips and the error is identified. Schematic of the message-passing
    idea — a real qLDPC (bivariate-bicycle) graph has weight-6 checks; here the
    connectivity is thinned so the flow reads clearly."""

    def construct(self):
        self.camera.background_color = INK
        title = Text("Quantum LDPC: sparse Tanner graph + belief propagation", font_size=24).to_edge(UP, buff=0.4)
        self.play(FadeIn(title))

        # Six qubit (variable) nodes on top, three parity checks below.
        qpos = [np.array([-3.0 + i * 1.2, 1.3, 0]) for i in range(6)]
        cpos = [np.array([-2.4 + j * 2.4, -1.4, 0]) for j in range(3)]
        qnodes = VGroup(*[Dot(p, radius=0.18, color=DATA) for p in qpos])
        cnodes = VGroup(*[Square(0.42, color=CHECK, fill_color=CHECK, fill_opacity=0.18, stroke_width=3).move_to(p) for p in cpos])
        qlabs = VGroup(*[Text(f"q{i}", font_size=16, color=DATA).next_to(qnodes[i], UP, buff=0.1) for i in range(6)])
        clabs = VGroup(*[Text(f"c{j}", font_size=16, color=CHECK).next_to(cnodes[j], DOWN, buff=0.1) for j in range(3)])

        # Sparse support: each check touches three qubits (schematic, not weight-6).
        support = {0: [0, 1, 2], 1: [1, 2, 3], 2: [3, 4, 5]}
        edges = {}
        egroup = VGroup()
        for j, qs in support.items():
            for i in qs:
                e = Line(cpos[j], qpos[i], stroke_color=DIM, stroke_width=2)
                edges[(j, i)] = e
                egroup.add(e)

        self.play(Create(egroup), LaggedStartMap(GrowFromCenter, qnodes), FadeIn(cnodes), FadeIn(qlabs), FadeIn(clabs))
        b1 = stage_banner("① qubit nodes and parity checks — sparse (low-density) connections", DATA)
        self.play(FadeIn(b1))
        self.wait(0.5)

        # ② An error on q2 fires exactly the checks that touch it (c0 and c1).
        fired = [j for j, qs in support.items() if 2 in qs]  # -> [0, 1]
        self.play(qnodes[2].animate.set_color(ERR).scale(1.25))
        self.play(*[cnodes[j].animate.set_fill(ERR, opacity=0.35).set_stroke(ERR) for j in fired],
                  *[edges[(j, 2)].animate.set_stroke(ERR, width=4) for j in fired])
        b2 = stage_banner("② an error on q2 fires only the checks touching it (syndrome)", ERR)
        self.play(Transform(b1, b2))
        self.wait(0.5)

        # ③ Belief propagation: LLR messages pulse along the edges, check -> qubit.
        pulses = VGroup(*[Dot(cpos[j], radius=0.09, color=OK) for j in fired])
        self.add(pulses)
        b3 = stage_banner("③ belief propagation: log-likelihood messages pass along the edges", OK)
        self.play(Transform(b1, b3))
        self.play(*[MoveAlongPath(pulses[k], Line(cpos[j], qpos[2])) for k, j in enumerate(fired)], run_time=1.1)
        self.play(FadeOut(pulses))
        self.wait(0.3)

        # ④ The marginal at q2 crosses over: BP has localised the error.
        check = Text("✓ q2 localised", font_size=20, color=OK).next_to(qlabs[2], UP, buff=0.22)
        b4 = stage_banner("④ the marginal flips → the error is localised. High rate, sparse checks.", OK)
        self.play(qnodes[2].animate.set_color(OK), FadeIn(check), Transform(b1, b4))
        self.wait(1.5)
