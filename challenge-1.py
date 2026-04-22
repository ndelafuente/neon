from collections import defaultdict


class Highscores:
    scores: list[tuple[int, str]]

    def __init__(self) -> None:
        self.scores = []

    def insert_score(self, name: str, score: int):
        self.scores.append((score, name))

    def get_leaderboard(self, n: int) -> list[tuple[int, str]]:
        self.scores.sort(reverse=True)
        return self.scores[:n]

    def get_unique_leaderboard(self, n: int) -> dict[str, int]:
        self.scores.sort(reverse=True)
        unique_leaderboard = {}
        for score, name in self.scores:
            if len(unique_leaderboard) == n:
                break
            if name not in unique_leaderboard:
                unique_leaderboard[name] = score
        return unique_leaderboard

    def get_total_leaderboard(self, n: int) -> list[tuple[int, str]]:
        total_leaderboard = defaultdict(int)
        for score, name in self.scores:
            total_leaderboard[name] += score
        return sorted([(v, k) for k, v in total_leaderboard.items()], reverse=True)[:n]

    """
    Scale the leaderboard according to the given max score
    return the score rounded to the nearest integer
    """

    def get_scaled_leaderboard(self, n: int, max_score: int) -> list[tuple[int, str]]:
        leaderboard = self.get_leaderboard(n)
        high_score, _ = leaderboard[0]
        scale_factor = max_score / high_score
        scaled_leaderboard = [
            (round(score * scale_factor), name) for score, name in leaderboard
        ]
        return scaled_leaderboard


highscores = Highscores()

highscores.insert_score("Trevin", 40)
highscores.insert_score("Nico", 30)
highscores.insert_score("Nico", 50)
highscores.insert_score("Trevin", 20)
highscores.insert_score("Bob", 5)
highscores.insert_score("Alice", 10)

print("\nget_leaderbaord(3)")
print("Expecting: Nico 50, Trevin 40, Nico 30")
print(highscores.get_leaderboard(3))

print("\nget_unique_leaderboard(3)")
print("Expecting: Nico 50, Trevin 40, Alice 10")
print(highscores.get_unique_leaderboard(3))

print("\nget_total_leaderboard(3)")
print("Expecting: Nico 80, Trevin 60, Alice 10")
print(highscores.get_total_leaderboard(3))

print("\nget_scaled_leaderboard(3, 100)")
print("Expecting: Nico 100, Trevin 80, Nico 60")
print(highscores.get_scaled_leaderboard(3, 100))
print("\nget_scaled_leaderboard(3, 51)")
print("Expecting: Nico 51, Trevin 41, Nico 31")
print(highscores.get_scaled_leaderboard(3, 51))
