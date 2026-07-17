from sqlalchemy.orm import Session
from app.models.database import SessionLocal, engine, Base
from app.models.models import Program, Transformation, BlogPost

def seed_database():
    # Make sure tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if programs already exist
        if db.query(Program).count() == 0:
            print("Seeding programs...")
            programs = [
                Program(
                    title="Beginner Strength Blueprint",
                    description="A perfect introduction to linear progression barbell training. Focuses on squats, deadlifts, overhead presses, and bench presses. Includes simple progression sheets.",
                    price=999,
                    type="workout",
                    pdf_url="/uploads/beginner_strength.pdf"
                ),
                Program(
                    title="Aesthetic Muscle Builder (Hypertrophy)",
                    description="A 4-day upper/lower hypertrophy split designed to optimize volume and muscle group frequency. Perfect for lifters with 1+ years of consistent experience.",
                    price=1999,
                    type="workout",
                    pdf_url="/uploads/aesthetic_hypertrophy.pdf"
                ),
                Program(
                    title="Ultimate Elite Shred & Diet Plan",
                    description="Our premium combined training and nutrition plan. Optimized for fat loss while maintaining maximum lean tissue. Includes diet templates, macro guides, and high-intensity conditioning routines.",
                    price=2999,
                    type="both",
                    pdf_url="/uploads/elite_shred.pdf"
                )
            ]
            db.add_all(programs)
            db.commit()
            print("Programs seeded successfully.")
        else:
            print("Programs table not empty. Skipping seeding programs.")

        # Check if transformations exist
        if db.query(Transformation).count() == 0:
            print("Seeding transformations...")
            transformations = [
                Transformation(
                    before_img="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80",
                    after_img="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
                    story="Alex lost 15kg of fat and gained significant muscle definition in 12 weeks of using the Elite Shred plan.",
                    is_public=True
                ),
                Transformation(
                    before_img="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80",
                    after_img="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80", # placeholder, will render gracefully
                    story="Sarah added 5cm to her shoulder width and completely redefined her core using the Aesthetic Hypertrophy program.",
                    is_public=True
                )
            ]
            db.add_all(transformations)
            db.commit()
            print("Transformations seeded successfully.")

        # Check if blog posts exist
        if db.query(BlogPost).count() == 0:
            print("Seeding blog posts...")
            blog_posts = [
                BlogPost(
                    title="How to Optimize Progressive Overload",
                    slug="optimize-progressive-overload",
                    body="Progressive overload is the foundation of muscle hypertrophy and strength gains. Learn how to increase weight, volume, frequency, and density over time to break plateaus.",
                    cover_img="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80"
                ),
                BlogPost(
                    title="The Truth About Fat Loss and Spot Reduction",
                    slug="fat-loss-spot-reduction-truth",
                    body="You cannot choose where you lose fat. Fat loss is systemic, dictated by a caloric deficit and genetics. We break down the science of fat mobilization and oxidation.",
                    cover_img="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80"
                )
            ]
            db.add_all(blog_posts)
            db.commit()
            print("Blog posts seeded successfully.")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
