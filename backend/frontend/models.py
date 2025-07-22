# models.py
from django.db import models
from django.core.exceptions import ValidationError

class Number(models.Model):
    value = models.FloatField("Значение числа", unique=True)
    flag = models.BooleanField("Использовано", default=False)

    def __str__(self):
        return str(self.value)

class Setting(models.Model):
    numbers = models.ManyToManyField(Number, through='SettingNumber', verbose_name="Выбранные числа")

    def clean(self):
        if Setting.objects.exclude(pk=self.pk).exists():
            raise ValidationError("Может существовать только один объект настроек.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return "Текущая настройка"

class SettingNumber(models.Model):
    setting = models.ForeignKey(Setting, on_delete=models.CASCADE)
    number = models.ForeignKey(Number, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ('setting', 'number')

    def __str__(self):
        return f"{self.number.value} (порядок: {self.order})"
