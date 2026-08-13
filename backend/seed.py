from sqlalchemy.orm import Session
from app.models.database import SessionLocal, engine, Base
from app.models.models import User, Program, ClientTransformation, MyTransformation, TransformationVideo, BlogPost, WebsiteSetting
from app.core.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check / Seed Admin user
        admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            print("Creating default admin account (admin@gnaneswarfit.com)...")
            admin_user = User(
                name="Gnaneswar Kokkirala (Coach)",
                email="admin@gnaneswarfit.com",
                phone="+91 98765 43210",
                password_hash=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print("Default admin created successfully! Credentials: admin@gnaneswarfit.com / admin123")

        # Check / Seed Programs
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

        # Seed Client Transformations
        if db.query(ClientTransformation).count() == 0:
            print("Seeding client transformations...")
            c_trans = [
                ClientTransformation(
                    client_name="Alex Carter",
                    before_img="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80",
                    after_img="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80",
                    story="Alex dropped 15kg of fat in 12 weeks with strict macro management and progressive overload on the Elite Shred plan.",
                    duration="12 Weeks",
                    before_weight="92 kg",
                    after_weight="77 kg",
                    goal="fat loss",
                    is_published=True
                ),
                ClientTransformation(
                    client_name="Sarah Jenkins",
                    before_img="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80",
                    after_img="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80",
                    story="Sarah shaped her shoulders and back while adding 4kg of pure lean muscle mass on the Aesthetic Hypertrophy routine.",
                    duration="16 Weeks",
                    before_weight="54 kg",
                    after_weight="58 kg",
                    goal="muscle gain",
                    is_published=True
                )
            ]
            db.add_all(c_trans)
            db.commit()

        # Seed My Transformations
        if db.query(MyTransformation).count() == 0:
            print("Seeding coach self transformations...")
            my_trans = MyTransformation(
                title="Coach Gnaneswar Personal Bodybuilding Transformation",
                story="Personal double biceps and aesthetic development journey from 60kg lean to 70kg full muscular contest conditioning. Utilizing compound overload routines, accurate caloric surpluses, and recovery management.",
                before_img="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80",
                after_img="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&q=80",
                after_img_2="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80",
                duration="24 Weeks",
                before_weight="60 kg",
                after_weight="70 kg",
                category="Bodybuilding Prep",
                is_published=True
            )
            db.add(my_trans)
            db.commit()

        # Seed Transformation Videos
        if db.query(TransformationVideo).count() == 0:
            print("Seeding transformation videos...")
            videos = [
                TransformationVideo(
                    title="12-Week Complete Fat Loss Walkthrough",
                    description="Watch Alex's week-by-week body composition shift, form checks, and caloric progression.",
                    client_name="Alex Carter",
                    thumbnail_url="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
                    video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                    is_published=True
                )
            ]
            db.add_all(videos)
            db.commit()

        # Seed Blog Posts
        if db.query(BlogPost).count() == 0:
            print("Seeding blog posts...")
            blog_posts = [
                BlogPost(
                    title="How to Master Progressive Overload for Natural Muscle Hypertrophy",
                    slug="master-progressive-overload-hypertrophy",
                    body="### The Science of Progressive Overload\n\nProgressive overload is the fundamental driver of muscle hypertrophy. You must systematically increase the stress placed on the musculoskeletal system over time.\n\n#### Key Overload Variables:\n1. **Load (Weight)**: Adding weight to the bar when RPE target is met.\n2. **Volume**: Increasing sets or reps in a target RPE range.\n3. **Frequency**: Splitting muscle groups 2x per week.\n4. **Technique Quality**: Slowing eccentric tempo and mastering full range of motion.",
                    cover_img="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80",
                    category="Training",
                    tags="hypertrophy,progressive overload,strength",
                    author="Gnaneswar Kokkirala",
                    is_published=True
                ),
                BlogPost(
                    title="The Truth About Fat Loss, Caloric Deficit & Spot Reduction",
                    slug="truth-about-fat-loss-caloric-deficit",
                    body="### Caloric Deficit vs Spot Reduction\n\nSpot reduction is a myth. You cannot lose fat solely from your abdomen by doing crunches. Fat loss occurs systemically when total daily energy expenditure (TDEE) exceeds total caloric intake.\n\n#### Fat Loss Principles:\n- **Caloric Deficit**: Target 300-500 kcal deficit daily.\n- **Protein Intake**: Consume 1.8-2.2g of protein per kg bodyweight.\n- **Sleep & Stress**: High cortisol inhibits fat oxidation.",
                    cover_img="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
                    category="Nutrition",
                    tags="fat loss,nutrition,diet",
                    author="Gnaneswar Kokkirala",
                    is_published=True
                )
            ]
            db.add_all(blog_posts)
            db.commit()

        # Seed Website Settings
        if db.query(WebsiteSetting).count() == 0:
            print("Seeding website settings...")
            settings_list = [
                WebsiteSetting(key="site_name", value="Gnaneswar Fit"),
                WebsiteSetting(key="site_tagline", value="Elite Bodybuilding Coaching & Nutrition Blueprints"),
                WebsiteSetting(key="coach_name", value="Gnaneswar Kokkirala"),
                WebsiteSetting(key="coach_title", value="Certified Strength & Conditioning Specialist"),
                WebsiteSetting(key="coach_bio", value="Specializing in scientific progressive overload, custom macronutrient modeling, and natural bodybuilding competition prep."),
                WebsiteSetting(key="contact_email", value="coach@gnaneswarfit.com"),
                WebsiteSetting(key="contact_phone", value="+91 98765 43210"),
                WebsiteSetting(key="instagram_url", value="https://instagram.com"),
                WebsiteSetting(key="youtube_url", value="https://youtube.com"),
                WebsiteSetting(key="logo_url", value="/logo.png")
            ]
            db.add_all(settings_list)
            db.commit()

        print("Database seeding completed successfully!")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
