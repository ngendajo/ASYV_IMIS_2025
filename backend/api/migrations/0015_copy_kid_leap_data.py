from django.db import migrations

def copy_kid_leap_relationships(apps, schema_editor):
    """
    Copy existing Kid-Leap relationships from the direct many-to-many table 
    to the new KidLeap intermediate model
    """
    Kid = apps.get_model('api', 'Kid')
    KidLeap = apps.get_model('api', 'KidLeap')
    
    print("Starting data migration for Kid-Leap relationships...")
    
    copied_count = 0
    for kid in Kid.objects.all():
        for leap in kid.leaps.all():
            kid_leap, created = KidLeap.objects.get_or_create(
                kid=kid,
                leap=leap,
                defaults={
                    'is_approved': True,  # Assume existing data is pre-approved
                    # recorded_by stays NULL for existing data - can be updated later by admin
                }
            )
            if created:
                copied_count += 1
    
    print(f"Successfully copied {copied_count} Kid-Leap relationships to KidLeap model")

def reverse_copy_kid_leap_relationships(apps, schema_editor):
    """
    Reverse operation: restore Kid-Leap relationships from KidLeap back to direct many-to-many
    (Only needed if you need to rollback this migration)
    """
    Kid = apps.get_model('api', 'Kid')
    KidLeap = apps.get_model('api', 'KidLeap')
    
    print("Reversing Kid-Leap relationship migration...")
    
    restored_count = 0
    for kid_leap in KidLeap.objects.all():
        # Add the relationship back to the direct many-to-many
        kid_leap.kid.leaps.add(kid_leap.leap)
        restored_count += 1
    
    print(f"Restored {restored_count} Kid-Leap relationships to direct many-to-many")

class Migration(migrations.Migration):
    
    dependencies = [
        ('api', '0014_kidleap'),  # Your previous migration that created KidLeap model
    ]

    operations = [
        migrations.RunPython(
            copy_kid_leap_relationships,
            reverse_copy_kid_leap_relationships,
            elidable=True,  # This migration can be optimized away if no data exists
        ),
    ]