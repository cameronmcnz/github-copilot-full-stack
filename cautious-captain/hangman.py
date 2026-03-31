import random
import tkinter as tk


MAX_WRONG_GUESSES = 8
WORDS = [
    "asyncio",
    "black",
    "celery",
    "cython",
    "dataclass",
    "django",
    "fastapi",
    "flask",
    "generator",
    "gunicorn",
    "jinja",
    "mypy",
    "numpy",
    "pandas",
    "pydantic",
    "pyproject",
    "pytest",
    "pytorch",
    "requests",
    "sqlalchemy",
    "starlette",
    "tailwind",
    "tuple",
    "typescript",
    "uvicorn",
    "virtualenv",
    "vite",
    "websocket",
]

BG_PALETTE = ["#070b12", "#111827", "#1e1b4b", "#0f172a", "#1a1025"]
ACCENT_PALETTE = ["#ff4d6d", "#00e5ff", "#facc15", "#7c3aed", "#39ff88"]
MESSAGE_WIN = [
    "You brute-forced destiny.",
    "Ship secured. The stack obeys.",
    "Victory smells like hot silicon.",
]
MESSAGE_LOSE = [
    "Runtime wreck. The word slipped away.",
    "You fed the bug and it grew teeth.",
    "The compiler laughs in neon.",
]


class LoudHangman:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Neon Brutalist Hangman")
        self.root.geometry("1100x760")
        self.root.minsize(980, 700)

        self.flash_job = None
        self.marquee_job = None
        self.word = ""
        self.guessed_letters = set()
        self.wrong_guesses = 0
        self.game_over = False
        self.flash_index = 0
        self.message_index = 0

        self.main_frame = tk.Frame(self.root, bg=BG_PALETTE[0])
        self.main_frame.pack(fill="both", expand=True)

        self.header = tk.Label(
            self.main_frame,
            text="NEON HANGMAN MAYHEM",
            font=("Impact", 28),
            bg=BG_PALETTE[0],
            fg=ACCENT_PALETTE[0],
            pady=14,
        )
        self.header.pack(fill="x")

        self.marquee = tk.Label(
            self.main_frame,
            text="PYTHON WORDS. TYPE GUESSING. ABSOLUTE CHAOS.",
            font=("Consolas", 14, "bold"),
            bg="#020617",
            fg="#f8fafc",
            pady=8,
        )
        self.marquee.pack(fill="x", padx=12, pady=(0, 12))

        self.content = tk.Frame(self.main_frame, bg=BG_PALETTE[0])
        self.content.pack(fill="both", expand=True, padx=18, pady=12)

        self.canvas = tk.Canvas(
            self.content,
            width=520,
            height=520,
            bg="#030712",
            highlightthickness=4,
            highlightbackground="#334155",
        )
        self.canvas.grid(row=0, column=0, rowspan=6, sticky="nsew", padx=(0, 18))

        self.side_panel = tk.Frame(
            self.content,
            bg="#111827",
            highlightthickness=4,
            highlightbackground="#475569",
            padx=18,
            pady=18,
        )
        self.side_panel.grid(row=0, column=1, sticky="nsew")

        self.status_label = tk.Label(
            self.side_panel,
            text="Brace for nonsense.",
            font=("Consolas", 18, "bold"),
            bg="#111827",
            fg="#f8fafc",
            wraplength=420,
            justify="left",
            pady=10,
        )
        self.status_label.pack(fill="x")

        self.turns_label = tk.Label(
            self.side_panel,
            text="8 misses remain",
            font=("Consolas", 16, "bold"),
            bg="#111827",
            fg="#facc15",
            pady=6,
        )
        self.turns_label.pack(fill="x")

        self.word_label = tk.Label(
            self.side_panel,
            text="",
            font=("Consolas", 28, "bold"),
            bg="#0f172a",
            fg="#e2e8f0",
            pady=18,
            padx=12,
        )
        self.word_label.pack(fill="x", pady=(12, 12))

        self.guesses_label = tk.Label(
            self.side_panel,
            text="Misses: none yet",
            font=("Consolas", 14),
            bg="#111827",
            fg="#cbd5e1",
            wraplength=420,
            justify="left",
            pady=6,
        )
        self.guesses_label.pack(fill="x")

        entry_frame = tk.Frame(self.side_panel, bg="#111827")
        entry_frame.pack(fill="x", pady=(18, 10))

        self.guess_entry = tk.Entry(
            entry_frame,
            font=("Consolas", 24, "bold"),
            justify="center",
            width=5,
            bg="#020617",
            fg="#38bdf8",
            insertbackground="#f8fafc",
            relief="flat",
        )
        self.guess_entry.pack(side="left", fill="x", expand=True, ipady=12)
        self.guess_entry.bind("<Return>", self.handle_guess)

        self.guess_button = tk.Button(
            entry_frame,
            text="FIRE",
            command=self.handle_guess,
            font=("Impact", 20),
            bg="#ef4444",
            fg="#020617",
            activebackground="#f97316",
            activeforeground="#020617",
            relief="flat",
            padx=18,
            pady=8,
        )
        self.guess_button.pack(side="left", padx=(12, 0))

        self.keyboard_frame = tk.Frame(self.side_panel, bg="#111827")
        self.keyboard_frame.pack(fill="both", expand=True, pady=(10, 12))

        self.letter_buttons = {}
        for index, letter in enumerate("abcdefghijklmnopqrstuvwxyz"):
            button = tk.Button(
                self.keyboard_frame,
                text=letter.upper(),
                command=lambda value=letter: self.handle_guess(value),
                width=4,
                font=("Consolas", 11, "bold"),
                bg="#1f2937",
                fg="#f8fafc",
                activebackground="#06b6d4",
                activeforeground="#020617",
                relief="flat",
                pady=8,
            )
            button.grid(row=index // 6, column=index % 6, padx=4, pady=4, sticky="nsew")
            self.letter_buttons[letter] = button

        for col in range(6):
            self.keyboard_frame.grid_columnconfigure(col, weight=1)

        self.reset_button = tk.Button(
            self.side_panel,
            text="NEW ROUND",
            command=self.start_game,
            font=("Impact", 20),
            bg="#22c55e",
            fg="#020617",
            activebackground="#bef264",
            activeforeground="#020617",
            relief="flat",
            pady=8,
        )
        self.reset_button.pack(fill="x")

        self.content.grid_columnconfigure(0, weight=3)
        self.content.grid_columnconfigure(1, weight=2)
        self.content.grid_rowconfigure(0, weight=1)

        self.start_game()
        self.animate_marquee()
        self.animate_flash()

    def start_game(self) -> None:
        self.word = random.choice(WORDS)
        self.guessed_letters = set()
        self.wrong_guesses = 0
        self.game_over = False
        self.status_label.config(text="New word loaded. Make your guess.")
        self.guess_entry.config(state="normal")
        self.guess_button.config(state="normal")
        self.guess_entry.delete(0, tk.END)
        for letter, button in self.letter_buttons.items():
            button.config(state="normal", bg="#1f2937", fg="#f8fafc")
        self.update_ui()
        self.guess_entry.focus_set()

    def handle_guess(self, value=None) -> None:
        if self.game_over:
            return

        if isinstance(value, str):
            guess = value.lower()
        else:
            guess = self.guess_entry.get().strip().lower()

        self.guess_entry.delete(0, tk.END)
        if len(guess) != 1 or not guess.isalpha():
            self.status_label.config(text="One letter. No excuses.")
            return

        if guess in self.guessed_letters:
            self.status_label.config(text=f"{guess.upper()} was already fired.")
            return

        self.guessed_letters.add(guess)
        if guess in self.letter_buttons:
            self.letter_buttons[guess].config(state="disabled", bg="#334155", fg="#94a3b8")

        if guess in self.word:
            if guess in self.letter_buttons:
                self.letter_buttons[guess].config(bg="#22c55e", fg="#020617")
            self.status_label.config(text=f"Direct hit. {guess.upper()} is in the stack.")
        else:
            self.wrong_guesses += 1
            if guess in self.letter_buttons:
                self.letter_buttons[guess].config(bg="#ef4444", fg="#020617")
            self.status_label.config(text=f"Missed. {guess.upper()} sinks into the void.")

        if all(letter in self.guessed_letters for letter in set(self.word)):
            self.game_over = True
            self.status_label.config(text=random.choice(MESSAGE_WIN))
        elif self.wrong_guesses >= MAX_WRONG_GUESSES:
            self.game_over = True
            self.status_label.config(text=f"{random.choice(MESSAGE_LOSE)} Word was {self.word.upper()}.")

        if self.game_over:
            self.guess_entry.config(state="disabled")
            self.guess_button.config(state="disabled")
            for button in self.letter_buttons.values():
                button.config(state="disabled")

        self.update_ui()

    def update_ui(self) -> None:
        display_word = " ".join(
            letter.upper() if letter in self.guessed_letters or self.game_over else "_"
            for letter in self.word
        )
        misses = sorted(letter.upper() for letter in self.guessed_letters if letter not in self.word)
        remaining = MAX_WRONG_GUESSES - self.wrong_guesses
        self.word_label.config(text=display_word)
        self.turns_label.config(text=f"{remaining} misses remain")
        self.guesses_label.config(text="Misses: " + (", ".join(misses) if misses else "none yet"))
        self.draw_scene()

    def animate_marquee(self) -> None:
        text = self.marquee.cget("text")
        self.marquee.config(text=text[1:] + text[0])
        self.message_index = (self.message_index + 1) % len(ACCENT_PALETTE)
        self.marquee.config(fg=ACCENT_PALETTE[self.message_index])
        self.marquee_job = self.root.after(160, self.animate_marquee)

    def animate_flash(self) -> None:
        self.flash_index = (self.flash_index + 1) % len(BG_PALETTE)
        bg = BG_PALETTE[self.flash_index]
        accent = ACCENT_PALETTE[self.flash_index % len(ACCENT_PALETTE)]
        alt = ACCENT_PALETTE[(self.flash_index + 2) % len(ACCENT_PALETTE)]
        self.main_frame.config(bg=bg)
        self.content.config(bg=bg)
        self.header.config(bg=bg, fg=accent)
        self.canvas.config(highlightbackground=accent)
        self.side_panel.config(highlightbackground=alt)
        self.flash_job = self.root.after(280, self.animate_flash)

    def draw_scene(self) -> None:
        self.canvas.delete("all")
        accent = ACCENT_PALETTE[self.flash_index % len(ACCENT_PALETTE)]
        alt = ACCENT_PALETTE[(self.flash_index + 1) % len(ACCENT_PALETTE)]
        glow = ACCENT_PALETTE[(self.flash_index + 2) % len(ACCENT_PALETTE)]

        self.canvas.create_rectangle(0, 0, 520, 520, fill="#020617", outline="")
        for stripe in range(0, 520, 28):
            self.canvas.create_line(0, stripe, 520, stripe, fill="#0f172a", width=2)

        self.canvas.create_text(
            260,
            40,
            text="HANGMAN.EXE",
            fill=accent,
            font=("Impact", 26),
        )
        self.canvas.create_text(
            260,
            75,
            text="8-TURN SURVIVAL MODE",
            fill="#f8fafc",
            font=("Consolas", 14, "bold"),
        )

        self.canvas.create_line(80, 460, 250, 460, fill="#94a3b8", width=8)
        self.canvas.create_line(130, 460, 130, 100, fill="#e2e8f0", width=10)
        self.canvas.create_line(130, 105, 315, 105, fill="#e2e8f0", width=10)
        self.canvas.create_line(315, 105, 315, 150, fill="#e2e8f0", width=8)

        self.canvas.create_oval(360, 75, 490, 205, outline=glow, width=4)
        self.canvas.create_text(425, 140, text="BUG", fill=accent, font=("Impact", 28))

        body_parts = [
            lambda: self.canvas.create_oval(275, 150, 355, 230, outline=accent, width=7),
            lambda: self.canvas.create_line(315, 230, 315, 330, fill=accent, width=7),
            lambda: self.canvas.create_line(315, 250, 255, 295, fill=alt, width=7),
            lambda: self.canvas.create_line(315, 250, 375, 295, fill=alt, width=7),
            lambda: self.canvas.create_line(315, 330, 265, 400, fill=glow, width=7),
            lambda: self.canvas.create_line(315, 330, 365, 400, fill=glow, width=7),
            lambda: self.canvas.create_text(315, 193, text="X", fill="#f8fafc", font=("Impact", 24)),
            lambda: self.canvas.create_text(315, 430, text="SEGFAULT", fill="#ef4444", font=("Impact", 26)),
        ]
        for index in range(self.wrong_guesses):
            body_parts[index]()

        if self.game_over and self.wrong_guesses < MAX_WRONG_GUESSES:
            for burst in range(12):
                x = random.randint(60, 460)
                y = random.randint(120, 470)
                radius = random.randint(6, 18)
                color = random.choice(ACCENT_PALETTE)
                self.canvas.create_oval(x, y, x + radius, y + radius, fill=color, outline="")

        self.canvas.create_text(
            260,
            490,
            text="TYPE FAST. FAIL LOUD.",
            fill="#cbd5e1",
            font=("Consolas", 16, "bold"),
        )


def main() -> None:
    root = tk.Tk()
    LoudHangman(root)
    root.mainloop()


if __name__ == "__main__":
    main()