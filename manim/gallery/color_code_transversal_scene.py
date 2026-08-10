from manim import *

class ColorCodeTransversalScene(Scene):
    def construct(self):
        # Dark Navy Theme
        self.camera.background_color = "#0B1120"

        # Title & Subtitle
        title = Text("Color Code Transversal Gate Execution", font="monospace", font_size=24, color="#EAF0FB").to_edge(UP, buff=0.4)
        subtitle = Text("2D color codes admit transversal Clifford gates (H, S, CNOT) without distillation factories", font="monospace", font_size=13, color="#8491AD")
        subtitle.next_to(title, DOWN, buff=0.15)

        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.4)

        # 3-Colorable Triangular Plaquettes
        tri1 = Polygon([-2.2, 1.2, 0], [0, 1.2, 0], [-1.1, -1.0, 0], fill_color="#F43F5E", fill_opacity=0.35, stroke_color="#F43F5E", stroke_width=2)
        tri2 = Polygon([0, 1.2, 0], [2.2, 1.2, 0], [1.1, -1.0, 0], fill_color="#10B981", fill_opacity=0.35, stroke_color="#10B981", stroke_width=2)
        tri3 = Polygon([-1.1, -1.0, 0], [1.1, -1.0, 0], [0, -2.4, 0], fill_color="#22D3EE", fill_opacity=0.35, stroke_color="#22D3EE", stroke_width=2)

        r_lbl = Text("Red (R)", font="monospace", font_size=11, color="#F43F5E").move_to([-1.1, 0.5, 0])
        g_lbl = Text("Green (G)", font="monospace", font_size=11, color="#10B981").move_to([1.1, 0.5, 0])
        b_lbl = Text("Blue (B)", font="monospace", font_size=11, color="#22D3EE").move_to([0, -1.5, 0])

        self.play(Create(tri1), Create(tri2), Create(tri3), Write(r_lbl), Write(g_lbl), Write(b_lbl))

        # Physical Qubit Vertices
        vertices_coords = [[-2.2, 1.2, 0], [0, 1.2, 0], [2.2, 1.2, 0], [-1.1, -1.0, 0], [1.1, -1.0, 0], [0, -2.4, 0]]
        qubits = VGroup(*[Dot(c, radius=0.14, color="#22D3EE") for c in vertices_coords])
        qlabels = VGroup(*[
            Text(f"q{i}", font="monospace", font_size=12, color="#EAF0FB").next_to(qubits[i], UP if i < 3 else DOWN, buff=0.10)
            for i in range(6)
        ])

        self.play(LaggedStartMap(GrowFromCenter, qubits), FadeIn(qlabels))
        self.wait(0.4)

        # Transversal H Flash
        h_txt = Text("Transversal H Gate: H^(⊗n) Flips All X & Z Stabilizers Simultaneously", font="monospace", font_size=15, color="#8B5CF6").to_edge(DOWN, buff=0.35)

        self.play(
            tri1.animate.set_fill(color="#8B5CF6", opacity=0.75),
            tri2.animate.set_fill(color="#8B5CF6", opacity=0.75),
            tri3.animate.set_fill(color="#8B5CF6", opacity=0.75),
            *[q.animate.set_color("#8B5CF6").scale(1.2) for q in qubits],
            Write(h_txt),
            run_time=1.4
        )
        self.wait(1.2)
