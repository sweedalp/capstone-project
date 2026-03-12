"""
utils/particles.py
Particle system for cinematic visual effects
"""

import math
import random
from PIL import ImageDraw
from utils.colors import hex_to_rgb, interpolate_color


class Particle:
    """Single particle with physics."""

    def __init__(self, x, y, vx, vy, color, size, lifetime, particle_type="dot"):
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy
        self.color = color
        self.size = size
        self.lifetime = lifetime
        self.age = 0.0
        self.particle_type = particle_type
        self.opacity = 1.0
        self.rotation = random.uniform(0, 2 * math.pi)
        self.rot_speed = random.uniform(-0.1, 0.1)

    def update(self, dt=0.016):
        self.x += self.vx * dt
        self.y += self.vy * dt
        self.age += dt
        self.rotation += self.rot_speed

        # Fade out near end of life
        life_ratio = self.age / self.lifetime
        if life_ratio > 0.7:
            self.opacity = max(0, 1.0 - (life_ratio - 0.7) / 0.3)

    @property
    def alive(self):
        return self.age < self.lifetime


class ParticleSystem:
    """Manages multiple particle emitters and effects."""

    def __init__(self, width, height):
        self.w = width
        self.h = height
        self.particles = []

    def emit_floating_dots(self, count=30, color="#00d4ff"):
        """Background floating particles."""
        c = hex_to_rgb(color)
        for _ in range(count):
            self.particles.append(Particle(
                x=random.randint(0, self.w),
                y=random.randint(0, self.h),
                vx=random.uniform(-15, 15),
                vy=random.uniform(-20, -5),
                color=c,
                size=random.uniform(1.5, 4),
                lifetime=random.uniform(3, 8),
                particle_type="dot",
            ))

    def emit_sparkle(self, cx, cy, count=15, color="#00d4ff"):
        """Sparkle burst from a point."""
        c = hex_to_rgb(color)
        for _ in range(count):
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(30, 120)
            self.particles.append(Particle(
                x=cx, y=cy,
                vx=speed * math.cos(angle),
                vy=speed * math.sin(angle),
                color=c,
                size=random.uniform(2, 5),
                lifetime=random.uniform(0.5, 1.5),
                particle_type="sparkle",
            ))

    def emit_confetti(self, count=40, colors=None):
        """Celebration confetti."""
        if colors is None:
            colors = ["#00d4ff", "#7c3aed", "#10b981", "#f59e0b", "#ef4444"]
        for _ in range(count):
            c = hex_to_rgb(random.choice(colors))
            self.particles.append(Particle(
                x=random.randint(0, self.w),
                y=random.randint(-50, -10),
                vx=random.uniform(-30, 30),
                vy=random.uniform(40, 120),
                color=c,
                size=random.uniform(3, 7),
                lifetime=random.uniform(2, 5),
                particle_type="confetti",
            ))

    def emit_data_stream(self, x, y1, y2, count=20, color="#00d4ff"):
        """Data streaming particles along a vertical line."""
        c = hex_to_rgb(color)
        for _ in range(count):
            self.particles.append(Particle(
                x=x + random.uniform(-5, 5),
                y=random.uniform(y1, y2),
                vx=random.uniform(-2, 2),
                vy=random.uniform(-60, -20),
                color=c,
                size=random.uniform(1, 3),
                lifetime=random.uniform(1, 3),
                particle_type="data",
            ))

    def emit_orbit(self, cx, cy, radius, count=12, color="#7c3aed"):
        """Particles orbiting a center point."""
        c = hex_to_rgb(color)
        for i in range(count):
            angle = (2 * math.pi * i / count)
            self.particles.append(Particle(
                x=cx + radius * math.cos(angle),
                y=cy + radius * math.sin(angle),
                vx=-radius * 0.5 * math.sin(angle),
                vy=radius * 0.5 * math.cos(angle),
                color=c,
                size=random.uniform(2, 4),
                lifetime=random.uniform(2, 4),
                particle_type="orbit",
            ))

    def emit_connection_particles(self, x1, y1, x2, y2, count=8, color="#10b981"):
        """Particles flowing along a connection line."""
        c = hex_to_rgb(color)
        for i in range(count):
            t = random.uniform(0, 1)
            self.particles.append(Particle(
                x=x1 + (x2 - x1) * t,
                y=y1 + (y2 - y1) * t,
                vx=(x2 - x1) * 0.3,
                vy=(y2 - y1) * 0.3,
                color=c,
                size=random.uniform(2, 4),
                lifetime=random.uniform(0.5, 1.5),
                particle_type="connection",
            ))

    def update(self, dt=0.016):
        """Update all particles."""
        for p in self.particles:
            p.update(dt)
        self.particles = [p for p in self.particles if p.alive]

    def render(self, draw, progress=0.0):
        """Render all particles onto a draw context."""
        # Update based on progress
        self.update(0.04)

        for p in self.particles:
            if p.opacity <= 0.01:
                continue

            alpha_color = tuple(int(c * p.opacity) for c in p.color)
            x, y = int(p.x), int(p.y)
            s = p.size

            if p.particle_type == "dot":
                draw.ellipse([x - s, y - s, x + s, y + s], fill=alpha_color)

            elif p.particle_type == "sparkle":
                # Cross shape
                draw.line([(x - s, y), (x + s, y)], fill=alpha_color, width=1)
                draw.line([(x, y - s), (x, y + s)], fill=alpha_color, width=1)

            elif p.particle_type == "confetti":
                # Small rectangle
                w = s * 1.5
                h = s * 0.6
                draw.rectangle([x - w, y - h, x + w, y + h], fill=alpha_color)

            elif p.particle_type == "data":
                # Small dash
                draw.line([(x, y), (x, y + s * 2)], fill=alpha_color, width=1)

            elif p.particle_type == "connection":
                draw.ellipse([x - s, y - s, x + s, y + s], fill=alpha_color)

            elif p.particle_type == "orbit":
                draw.ellipse([x - s, y - s, x + s, y + s], fill=alpha_color)

    def clear(self):
        """Remove all particles."""
        self.particles.clear()


def create_ambient_particles(width, height, theme_color="#00d4ff", density=0.00003):
    """Create a pre-populated particle system for ambient background."""
    ps = ParticleSystem(width, height)
    count = int(width * height * density)
    ps.emit_floating_dots(count=max(10, count), color=theme_color)
    return ps