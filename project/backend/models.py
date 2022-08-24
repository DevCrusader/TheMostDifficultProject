from django.db import models
from datetime import datetime, timedelta


# Create your models here.
class StudioState(models.Model):
    class StateChoice(models.TextChoices):
        opened = "Opened"
        closed = "Closed"
        undefined = "Undefined"

    state = models.CharField(
        max_length=10,
        choices=StateChoice.choices,
        default=StateChoice.undefined,
        null=False, blank=False)

    date = models.DateField(null=False, blank=False, unique=True)
    time_from = models.TimeField(null=True, blank=True)
    time_to = models.TimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.date} studio is {self.state}"

    def set_state(self, state):
        if state in map(lambda x: x[0], self.StateChoice.choices):
            if self.state != state:
                self.state = state

                if state == "Opened":
                    dt_now = datetime.now()
                    time_now = dt_now.time()

                    if time_now.hour < 9:
                        self.time_from = datetime.strptime("09:00", "%H:%M")
                    else:
                        self.time_from = time_now

                    if time_now.hour < 21:
                        self.time_to = datetime.strptime("21:00", "%H:%M")
                    else:
                        self.time_to = (dt_now + timedelta(hours=1)).time()

                else:
                    self.time_from = None
                    self.time_to = None
                self.save()
            return
        return "Incorrect state"

    def set_time(self, time_, param):
        if param == "from":
            self.time_from = datetime.strptime(time_, "%H:%M").time()
            return
        if param == "to":
            self.time_to = datetime.strptime(time_, "%H:%M").time()
            return
        self.save()
        return "Incorrect param"

    def duration(self):
        return {
            "from": self.time_from.strftime("%H:%M"),
            'to': self.time_to.strftime("%H:%M")
        } if self.time_from else None

    class Meta:
        verbose_name = "Состояние студии"
        verbose_name_plural = 'Состояния студии'
        ordering = ['-date']
