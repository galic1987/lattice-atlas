from manim import *

class ColorCodeTransversalScene(Scene):
    def construct(self):
        # Dark Navy Theme
        self.camera.background_color = "#0B1120"

        # Title
        title = Text("Color Code Transversal Gate Execution", font="monospace", font_size=28, color="#EAF0FB")
        title.to_edge(UP)
        subtitle = Text("2D color codes admit transversal Clifford gates (H, S) — but NOT T (needs magic states)", font="monospace", font_size=14, color="#8491AD")
        subtitle.next_to(title, DOWN, buff=0.2)

        self.play(Write(title), FadeIn(subtitle))
        self.wait(0.5)

        # 3-Colorable Triangular Plaquettes
        tri1 = Polygon([-2, 1, 0], [0, 1, 0], [-1, -1, 0], fill_color="#F43F5E", fill_opacity=0.4, stroke_color="#F43F5E", stroke_width=2)
        tri2 = Polygon([0, 1, 0], [2, 1, 0], [1, -1, 0], fill_color="#10B981", fill_opacity=0.4, stroke_color="#10B981", stroke_width=2)
        tri3 = Polygon([-1, -1, 0], [1, -1, 0], [0, -2.5, 0], fill_color="#22D3EE", fill_opacity=0.4, stroke_color="#22D3EE", stroke_width=2)

        r_lbl = Text("Red Face (R)", font="monospace", font_size=12, color="#F43F5E").move_to([-1, 0.4, 0])
        g_lbl = Text("Green Face (G)", font="monospace", font_size=12, color="#10B981").move_to([1, 0.4, 0])
        b_lbl = Text("Blue Face (B)", font="monospace", font_size=12, color="#22D3EE").move_to([0, -1.5, 0])

        self.play(Create(tri1), Create(tri2), Create(tri3), Write(r_lbl), Write(g_lbl), Write(b_lbl))

        # Transversal H Flash
        h_txt = Text("Transversal H Gate: H^(⊗n) Flips All X & Z Plaquettes", font="monospace", font_size=18, color="#8B5CF6")
        h_txt.to_edge(DOWN)

        self.play(
            tri1.animate.set_fill(color="#8B5CF6", opacity=0.8),
            tri2.animate.set_fill(color="#8B5CF6", opacity=0.8),
            tri3.animate.set_fill(color="#8B5CF6", opacity=0.8),
            Write(h_txt),
            run_time=1.5
        )
        self.wait(1.0)
