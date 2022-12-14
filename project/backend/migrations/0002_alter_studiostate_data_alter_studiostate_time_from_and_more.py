# Generated by Django 4.1 on 2022-08-14 19:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='studiostate',
            name='data',
            field=models.DateField(unique=True),
        ),
        migrations.AlterField(
            model_name='studiostate',
            name='time_from',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='studiostate',
            name='time_to',
            field=models.TimeField(blank=True, null=True),
        ),
    ]
