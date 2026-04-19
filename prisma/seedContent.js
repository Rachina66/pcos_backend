import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const articles = [
  
  // PCOS BASICS
 
  {
    title: "What is PCOS? Understanding the Basics",
    content: `Polycystic Ovary Syndrome (PCOS) is one of the most common hormonal disorders affecting women of reproductive age, impacting approximately 1 in 10 women worldwide. In Nepal, studies suggest prevalence rates between 9 and 18 percent among reproductive-age women.

PCOS is characterized by three main features: irregular or absent menstrual periods, excess androgen (male hormone) levels causing symptoms like acne and excess hair growth, and polycystic ovaries visible on ultrasound. You do not need all three features to be diagnosed with PCOS.

The exact cause of PCOS remains unknown, but insulin resistance plays a central role. When cells do not respond properly to insulin, the pancreas produces more insulin, which stimulates the ovaries to produce excess androgens. This disrupts the normal ovulation cycle.

Common symptoms include irregular periods or no periods at all, difficulty getting pregnant, excess hair growth on the face, chest or back, weight gain especially around the abdomen, thinning hair on the head, oily skin or acne, and mood changes such as depression or anxiety.

PCOS is a lifelong condition but its symptoms can be managed effectively through lifestyle changes, medication, and regular monitoring. Early diagnosis is key to preventing long-term complications including type 2 diabetes, cardiovascular disease, and endometrial cancer. If you suspect you have PCOS, speak with your doctor about getting a proper diagnosis.`,
    category: "PCOS_BASICS",
    tags: ["pcos", "overview", "symptoms", "diagnosis", "hormones"],
    isPublished: true,
  },
  {
    title: "PCOS and Insulin Resistance: What You Need to Know",
    content: `Insulin resistance is present in approximately 70 percent of women with PCOS, making it one of the most important underlying factors to understand and address in managing this condition.

When you eat carbohydrates, your body breaks them down into glucose. Insulin, produced by the pancreas, acts as a key that lets glucose enter your cells for energy. In insulin resistance, the cells do not respond properly to insulin, so the pancreas produces more and more insulin to compensate.

High insulin levels directly trigger the ovaries to produce excess testosterone and other androgens. This disrupts the delicate hormonal balance needed for regular ovulation, leading to the hallmark symptoms of PCOS.

Signs of insulin resistance include dark patches of skin in neck folds, armpits or groin (a condition called acanthosis nigricans), difficulty losing weight especially around the abdomen, sugar cravings and energy crashes after meals, and feeling tired and sluggish after eating.

Managing insulin resistance through diet, exercise and sometimes medication such as Metformin is the most effective way to improve PCOS symptoms. Even a 5 to 10 percent reduction in body weight can significantly restore hormonal balance and improve fertility in women with PCOS. Focus on low glycemic index foods, regular movement, and reducing refined sugar and processed carbohydrates in your daily diet.`,
    category: "PCOS_BASICS",
    tags: ["insulin resistance", "hormones", "blood sugar", "metabolism"],
    isPublished: true,
  },
  {
    title: "PCOS and Fertility: What Every Woman Should Know",
    content: `PCOS is one of the leading causes of female infertility, affecting up to 80 percent of women who struggle to conceive due to ovulation problems. However, it is important to understand that PCOS does not mean you cannot have children. Most women with PCOS can and do become pregnant with the right support.

The main fertility challenge in PCOS is irregular or absent ovulation. Without ovulation, an egg is not released and pregnancy cannot occur naturally. Hormonal imbalances, particularly elevated androgens and insulin resistance, are the root cause of this ovulation disruption.

Lifestyle changes are the first line of treatment for PCOS-related fertility issues. Losing even 5 percent of body weight if overweight can restore ovulation in many women. A balanced low glycemic diet, regular exercise, and stress management can significantly improve ovulation frequency.

Medical treatments for PCOS fertility include ovulation induction medications such as letrozole or clomiphene citrate, Metformin to improve insulin sensitivity, and in more complex cases, injectable gonadotropins or IVF. Your doctor will recommend the best approach based on your individual situation.

If you are trying to conceive with PCOS, tracking your cycle carefully, maintaining a healthy weight, reducing processed food intake, and consulting a reproductive specialist are your most important first steps. Many women with PCOS achieve successful pregnancies with appropriate guidance and patience.`,
    category: "PCOS_BASICS",
    tags: ["fertility", "pregnancy", "ovulation", "treatment", "conception"],
    isPublished: true,
  },

  
  // NUTRITION
  
  {
    title: "Best Foods for PCOS: A Nepali Diet Guide",
    content: `Managing PCOS through diet is one of the most powerful tools available, and many traditional Nepali foods are excellent for PCOS management. Understanding what to eat and what to limit can make a significant difference in your symptoms.

Foods to include in your daily diet:

Rohu Fish is rich in omega-3 fatty acids which reduce PCOS-related inflammation and lower androgen levels. Aim for 2 to 3 servings per week. Mustard oil, a traditional Nepali cooking oil, contains omega-3 and has anti-inflammatory properties. Use in moderation for cooking.

Paneer is a high protein dairy food that helps stabilize blood sugar and reduce hunger, making it excellent for vegetarians with PCOS. Mung beans and lentils such as dal are excellent plant proteins with a low glycemic index, providing slow-release carbohydrates that prevent insulin spikes.

Spinach and palak are iron-rich leafy greens that address PCOS-related fatigue and contain magnesium which reduces insulin resistance. Bitter gourd or karela has proven blood glucose lowering properties and contains charantin which mimics insulin activity in the body.

Almonds reduce fasting insulin levels and lower androgen levels when consumed daily. Even a small handful of 10 to 15 almonds as a daily snack shows measurable benefits in clinical studies.

Foods to limit or avoid: White rice, white bread, and refined flour maida products cause rapid blood sugar spikes. Replace with smaller portions of brown rice or buckwheat. Sugary sweets, mithai, and sugary drinks worsen insulin resistance significantly. Ultra-processed foods containing hydrogenated oils increase inflammation and should be minimized.`,
    category: "NUTRITION",
    tags: ["diet", "nepali food", "nutrition", "anti-inflammatory", "insulin"],
    isPublished: true,
  },
  {
    title: "The Low Glycemic Index Diet for PCOS",
    content: `The glycemic index (GI) measures how quickly a food raises your blood sugar levels after eating. For women with PCOS, choosing low GI foods is one of the most effective dietary strategies to manage insulin resistance, reduce androgen levels, and improve menstrual regularity.

High GI foods cause a rapid spike in blood sugar, triggering a large insulin response. In women with PCOS who already have insulin resistance, this worsens the hormonal imbalance and can worsen symptoms over time. Low GI foods cause a slow, gradual rise in blood sugar, which keeps insulin levels stable.

Low GI foods to focus on include most vegetables, legumes such as lentils, chickpeas and mung beans, whole grains like brown rice, barley and buckwheat, most fruits except very ripe bananas and watermelon, dairy products like yogurt and paneer, and nuts and seeds.

High GI foods to reduce include white rice, white bread, potatoes, refined flour products, sugary drinks, sweets and desserts, and most packaged snack foods.

Practical tips for a low GI diet in Nepal: Replace white rice with smaller portions of brown rice or combine with more dal and vegetables to lower the overall GI of your meal. Add protein and healthy fat to every meal as they slow the absorption of carbohydrates. Eat regular meals every 3 to 4 hours to keep blood sugar stable. Never skip breakfast as it sets your blood sugar pattern for the day.

Research consistently shows that women with PCOS who follow a low GI diet experience improvements in menstrual regularity, reduced acne, better weight management, and improved fertility outcomes within 3 to 6 months.`,
    category: "NUTRITION",
    tags: ["glycemic index", "blood sugar", "diet", "carbohydrates", "insulin"],
    isPublished: true,
  },
  {
    title: "Anti-Inflammatory Eating for PCOS",
    content: `Chronic low-grade inflammation is now recognized as a key driver of PCOS symptoms. Women with PCOS show elevated inflammatory markers in their blood, and this inflammation worsens insulin resistance, increases androgen production, and disrupts ovulation. Adopting an anti-inflammatory diet is a powerful way to address the root cause of PCOS symptoms.

What causes inflammation in PCOS? Processed foods high in trans fats, refined sugars, and artificial additives directly trigger inflammatory pathways in the body. Excess body fat, particularly abdominal fat, produces inflammatory chemicals. High blood sugar from insulin resistance also drives inflammation, creating a vicious cycle.

Top anti-inflammatory foods for PCOS: Fatty fish such as rohu and salmon provide omega-3 fatty acids that directly reduce inflammatory markers. Turmeric contains curcumin, a potent anti-inflammatory compound. Add it to curries, dal, or warm milk daily. Berries are rich in anthocyanins and antioxidants that combat oxidative stress. Leafy greens like spinach contain vitamins C, E and K which reduce inflammation. Walnuts and almonds provide anti-inflammatory omega-3 fats and magnesium. Green tea contains epigallocatechin gallate which reduces inflammation and improves insulin sensitivity.

Foods that increase inflammation to avoid: Sugar and high fructose corn syrup found in packaged drinks and sweets. Refined carbohydrates like maida products. Vegetable oils high in omega-6 such as soybean and sunflower oil used in excess. Processed meats and fast food. Alcohol which directly increases inflammatory markers.

An anti-inflammatory eating pattern combined with adequate sleep and stress management provides a comprehensive approach to reducing PCOS symptoms from the inside out.`,
    category: "NUTRITION",
    tags: [
      "inflammation",
      "anti-inflammatory",
      "omega-3",
      "turmeric",
      "antioxidants",
    ],
    isPublished: true,
  },

  
  // EXERCISE
  
  {
    title: "Exercise Guide for Women with PCOS",
    content: `Regular physical activity is one of the most evidence-based interventions for PCOS management. Exercise improves insulin sensitivity, reduces androgen levels, supports weight management, and significantly improves mood and mental health. The key is finding the right type and amount of exercise for your body.

Strength training done 2 to 3 times per week is the most effective exercise for improving insulin sensitivity long-term. Building muscle mass increases the number of insulin receptors in your body, helping glucose enter cells more efficiently. Simple bodyweight exercises like squats, lunges, push-ups, and planks done at home require no equipment and take only 30 to 45 minutes per session.

Brisk walking is the most accessible exercise for most Nepali women and provides significant benefits. A 30 to 45 minute brisk walk daily improves blood sugar regulation, reduces stress hormones, and supports weight management. Walking after meals is particularly effective at blunting post-meal glucose spikes and is one of the simplest habits you can adopt.

Yoga offers specific benefits for PCOS by reducing cortisol levels, improving ovarian function, and managing the psychological burden of the condition. Poses such as butterfly pose, cobra pose, supported bridge pose, and child's pose are particularly recommended. Even 20 to 30 minutes of gentle yoga three times per week shows measurable hormonal improvements.

High Intensity Interval Training or HIIT involves short bursts of intense exercise followed by rest periods and is highly efficient for improving insulin resistance. An example is 20 seconds of fast stair climbing followed by 40 seconds of rest, repeated 10 times. HIIT sessions of just 20 minutes can provide benefits equivalent to longer moderate exercise sessions.

Important caution: Avoid over-exercising as excessive high intensity training raises cortisol which worsens PCOS. Rest days are essential. Start slowly if you are new to exercise and increase intensity gradually over 4 to 6 weeks.`,
    category: "EXERCISE",
    tags: ["exercise", "strength training", "yoga", "walking", "HIIT"],
    isPublished: true,
  },
  {
    title: "Yoga for PCOS: Poses That Help Balance Hormones",
    content: `Yoga is increasingly recognized as a valuable complementary therapy for PCOS management. Multiple clinical studies have shown that regular yoga practice reduces testosterone levels, improves insulin sensitivity, decreases anxiety and depression, and improves menstrual regularity in women with PCOS. Unlike high intensity exercise, yoga also lowers cortisol, the stress hormone that worsens PCOS when chronically elevated.

The following yoga poses are particularly beneficial for women with PCOS:

Butterfly Pose or Baddha Konasana involves sitting with the soles of your feet together and gently pressing your knees toward the floor. Hold for 1 to 2 minutes while breathing deeply. This pose stimulates the ovaries and uterus, improves blood flow to the pelvic region, and reduces menstrual discomfort.

Supported Bridge Pose or Setu Bandhasana involves lying on your back, bending your knees, and lifting your hips toward the ceiling. Hold for 30 to 60 seconds. This pose stimulates the thyroid gland, reduces anxiety, and improves blood flow to the reproductive organs.

Cobra Pose or Bhujangasana involves lying face down and lifting your chest using your back muscles and arms. Hold for 20 to 30 seconds. This pose stimulates the ovaries and adrenal glands, improves hormonal balance, and strengthens the back muscles.

Child's Pose or Balasana is a resting pose where you kneel and lower your forehead to the floor with arms extended. Hold for 1 to 3 minutes. This pose activates the parasympathetic nervous system, directly reducing cortisol and calming the stress response.

For best results, practice yoga for 30 to 45 minutes at least 3 times per week. A combination of active poses and restorative poses in each session provides the greatest hormonal benefit. Many women with PCOS report noticeable improvements in their cycle regularity within 3 months of consistent yoga practice.`,
    category: "EXERCISE",
    tags: ["yoga", "hormones", "poses", "cortisol", "menstrual health"],
    isPublished: true,
  },

  
  // MENTAL HEALTH
  
  {
    title: "PCOS and Mental Health: Managing Anxiety and Depression",
    content: `PCOS affects not just the body but profoundly impacts mental health. Research shows that women with PCOS are 3 times more likely to experience depression and 5 times more likely to experience anxiety compared to women without PCOS. Understanding this connection is essential for comprehensive PCOS care.

The mental health burden of PCOS comes from multiple sources. Physical symptoms like weight gain, acne, and excess hair growth directly impact self-esteem and body image. Hormonal imbalances, particularly elevated androgens and disrupted estrogen cycles, directly affect mood-regulating neurotransmitters in the brain. The chronic nature of PCOS and the challenges of fertility can create ongoing psychological stress.

Recognizing symptoms of depression and anxiety in PCOS: persistent sadness or emptiness, loss of interest in activities you used to enjoy, constant worry or fear, sleep disturbances, fatigue beyond what is expected, difficulty concentrating, and social withdrawal. These symptoms deserve attention and treatment just as much as the physical symptoms of PCOS.

Effective strategies for mental health with PCOS: Regular exercise is proven to reduce depression and anxiety through endorphin release and hormonal regulation. Even 30 minutes of walking daily produces measurable mood improvements. Mindfulness meditation practiced for just 10 minutes daily reduces cortisol and anxiety. Apps like Headspace or simply focusing on deep breathing exercises can help.

Social connection is particularly important. Sharing your experience with trusted friends, family, or a PCOS support community reduces the isolation that many women feel. Therapy, particularly Cognitive Behavioral Therapy or CBT, is highly effective for PCOS-related anxiety and depression. Do not hesitate to seek professional mental health support.

In Nepal, mental health support is increasingly available. Speaking with your doctor about both the physical and emotional aspects of your PCOS is an important step toward comprehensive wellbeing.`,
    category: "MENTAL_HEALTH",
    tags: ["mental health", "anxiety", "depression", "stress", "wellbeing"],
    isPublished: true,
  },
  {
    title: "Stress Management and PCOS: Breaking the Cycle",
    content: `Stress and PCOS have a complex bidirectional relationship. PCOS causes stress through its physical symptoms and life impacts, and stress in turn worsens PCOS by elevating cortisol levels which increase insulin resistance, disrupt ovulation, and raise androgen levels. Breaking this cycle is essential for effective PCOS management.

How stress worsens PCOS: When you experience stress, your adrenal glands release cortisol and adrenaline. Cortisol directly increases blood sugar, worsens insulin resistance, and stimulates the adrenal glands to produce more androgens including testosterone. Chronic stress also disrupts the hypothalamic-pituitary-ovarian axis, the hormonal signaling system that regulates your menstrual cycle.

Signs that stress is worsening your PCOS: your periods become more irregular during stressful periods, acne flares worsen with stress, you experience stronger cravings for sweet and processed foods, your sleep quality deteriorates, and you notice increased hair loss or facial hair growth.

Effective stress management techniques for PCOS:

Deep breathing exercises activate the parasympathetic nervous system and lower cortisol within minutes. Practice 4-7-8 breathing: inhale for 4 counts, hold for 7 counts, exhale for 8 counts. Do this for 5 minutes daily.

Progressive muscle relaxation involves tensing and releasing muscle groups throughout the body and is particularly effective for physical tension from stress. Journaling allows you to process emotions and reduce the mental burden of PCOS. Writing about your concerns for 10 to 15 minutes before bed improves sleep quality.

Setting boundaries and managing your schedule to reduce chronic overwhelm is as important as any medical treatment for PCOS. Prioritizing sleep of 7 to 9 hours per night is non-negotiable as sleep deprivation directly raises cortisol and worsens every aspect of PCOS.

Remember that managing stress is not a luxury. It is a core medical requirement for effective PCOS treatment.`,
    category: "MENTAL_HEALTH",
    tags: ["stress", "cortisol", "management", "mindfulness", "sleep"],
    isPublished: true,
  },

  
  // TREATMENT
  
  {
    title: "Medical Treatments for PCOS: What Are Your Options?",
    content: `PCOS treatment is individualized based on your specific symptoms, goals, and whether you are trying to conceive. There is no single cure for PCOS, but a combination of lifestyle changes and medical treatments can effectively manage symptoms and prevent long-term complications.

Medications commonly used for PCOS:

Combined oral contraceptive pills are often the first-line medical treatment for women not trying to conceive. They regulate menstrual cycles, reduce androgen levels, improve acne and hirsutism, and protect the uterine lining from the effects of irregular periods. They do not treat the underlying insulin resistance however.

Metformin is a medication originally developed for type 2 diabetes that is widely used in PCOS to improve insulin sensitivity. It helps regulate menstrual cycles, supports weight loss, reduces androgen levels, and improves fertility. It is particularly effective in women with PCOS who have insulin resistance or elevated blood sugar.

Anti-androgen medications such as spironolactone reduce the effects of testosterone on the body, improving symptoms like excess facial hair, scalp hair loss, and acne. They are typically used alongside contraceptive pills.

For women trying to conceive, ovulation induction medications such as letrozole or clomiphene citrate stimulate the ovaries to release an egg. Letrozole is currently preferred as it has higher live birth rates in women with PCOS.

Inositol supplements, particularly myo-inositol and D-chiro-inositol, are gaining evidence as effective supplements for improving insulin sensitivity and ovulation in PCOS with minimal side effects.

Always work with a qualified doctor to determine which treatments are appropriate for your individual situation. Never self-medicate or discontinue prescribed medications without medical guidance.`,
    category: "TREATMENT",
    tags: ["medication", "metformin", "treatment", "contraceptive", "inositol"],
    isPublished: true,
  },
  {
    title: "Natural Supplements for PCOS: Evidence-Based Guide",
    content: `Many women with PCOS explore natural supplements as part of their management plan. While supplements cannot replace medical treatment or lifestyle changes, several have good scientific evidence supporting their use in PCOS. Always consult your doctor before starting any supplement as they can interact with medications.

Myo-inositol is one of the most well-researched supplements for PCOS. It improves insulin sensitivity, restores ovulation, reduces androgen levels, and improves egg quality. The typical dose is 2 to 4 grams daily. It is considered safe with minimal side effects and is particularly beneficial for women trying to conceive.

Vitamin D deficiency is extremely common in women with PCOS and is linked to worsened insulin resistance, hormonal imbalance, and mood disorders. Getting your vitamin D level tested and supplementing if deficient can significantly improve PCOS outcomes. Most adults need 1000 to 2000 IU daily but your doctor will advise based on your blood levels.

Omega-3 fatty acids from fish oil supplements reduce inflammation, lower triglycerides, reduce androgen levels, and improve mood in PCOS. A daily dose of 1 to 3 grams of EPA and DHA combined is typically recommended.

Magnesium deficiency is common in women with insulin resistance and PCOS. Magnesium supplementation improves insulin sensitivity, reduces cortisol levels, improves sleep quality, and reduces PMS symptoms. Magnesium glycinate at 300 to 400 mg daily is a well-absorbed form.

Spearmint tea has shown in studies to reduce testosterone levels in women with PCOS when consumed as 2 cups daily. It is a simple, affordable, and safe addition to a PCOS management plan.

Zinc supplements can improve acne, reduce excess hair growth, and improve mood in PCOS. A dose of 25 to 30 mg daily with food is typically recommended.

Remember that supplements support but do not replace the foundational pillars of PCOS management: a low glycemic diet, regular exercise, stress management, and adequate sleep.`,
    category: "TREATMENT",
    tags: [
      "supplements",
      "inositol",
      "vitamin D",
      "omega-3",
      "magnesium",
      "natural",
    ],
    isPublished: true,
  },

  // LIFESTYLE

  {
    title: "Sleep and PCOS: Why Rest is Non-Negotiable",
    content: `Sleep is one of the most underrated but critically important factors in PCOS management. Poor sleep quality and insufficient sleep directly worsen every major aspect of PCOS including insulin resistance, cortisol levels, androgen production, weight management, and mood disorders.

The connection between sleep and PCOS runs deep. Women with PCOS have significantly higher rates of sleep disorders including obstructive sleep apnea, insomnia, and restless leg syndrome compared to women without PCOS. Sleep apnea in particular worsens insulin resistance and cardiovascular risk independently of body weight.

How poor sleep worsens PCOS: Even one night of poor sleep increases cortisol levels the following day, which raises blood sugar and worsens insulin resistance. Sleep deprivation increases ghrelin, the hunger hormone, and decreases leptin, the satiety hormone, creating powerful cravings for high carbohydrate and sugary foods. Chronic sleep deprivation raises inflammatory markers and disrupts the hormonal signals that regulate ovulation.

Signs that sleep may be affecting your PCOS: you feel unrefreshed after sleeping, you experience strong sugar and carbohydrate cravings especially in the morning, your acne or hair loss worsens, your periods become more irregular, and your mood and anxiety worsen.

Improving sleep with PCOS: Maintain a consistent sleep and wake time every day including weekends as this stabilizes your circadian rhythm and hormonal patterns. Create a dark, cool sleeping environment as temperature and light significantly affect sleep quality. Avoid screens for 1 hour before bed as blue light suppresses melatonin.

Avoid caffeine after 2 PM. Practice a calming pre-sleep routine such as reading, gentle stretching, or warm herbal tea. If you snore heavily or wake feeling unrefreshed, discuss the possibility of sleep apnea with your doctor as treatment can significantly improve your PCOS symptoms.

Aim for 7 to 9 hours of quality sleep every night. Think of sleep as a daily medical treatment for your PCOS.`,
    category: "LIFESTYLE",
    tags: ["sleep", "cortisol", "lifestyle", "circadian rhythm", "recovery"],
    isPublished: true,
  },
  {
    title: "Daily Habits That Improve PCOS Symptoms",
    content: `Managing PCOS is not about dramatic changes but about consistent daily habits that work together to restore hormonal balance. The following evidence-based daily practices, when maintained consistently, produce significant improvements in PCOS symptoms within 3 to 6 months.

Morning habits: Start your day with a protein-rich breakfast within 1 hour of waking. This stabilizes blood sugar from the moment you wake and prevents the cortisol spike that accompanies skipping breakfast. A meal of eggs, paneer, or yogurt with some nuts sets a stable hormonal foundation for the day. Drink a large glass of water first thing in the morning as even mild dehydration increases cortisol.

Movement throughout the day: Aim for at least 7000 to 8000 steps daily. Take a 10 to 15 minute walk after each main meal, particularly after lunch and dinner. This simple habit reduces post-meal blood sugar spikes by up to 30 percent and is one of the most effective and accessible interventions for insulin resistance. If you have a desk job, stand and move for 5 minutes every hour.

Meal timing and composition: Eat your largest meal earlier in the day as insulin sensitivity is highest in the morning and decreases through the day. Include protein and healthy fat with every meal and snack to slow carbohydrate absorption. Avoid eating within 2 hours of bedtime as late eating disrupts insulin and cortisol patterns overnight.

Evening habits: Spend 10 minutes on relaxation practices before bed such as deep breathing, gentle yoga, or meditation. This activates the parasympathetic nervous system and lowers cortisol before sleep. Prepare your meals and snacks for the next day in the evening to avoid poor food choices when busy or stressed.

Tracking: Keep a simple daily log of your food, sleep, mood, and symptoms. Patterns become visible over time and help you identify what makes your PCOS better or worse. This information is also valuable to share with your doctor.

Consistency is everything with PCOS. Small daily habits maintained over months produce far greater results than intensive short-term efforts.`,
    category: "LIFESTYLE",
    tags: [
      "habits",
      "daily routine",
      "blood sugar",
      "lifestyle",
      "consistency",
    ],
    isPublished: true,
  },
];

async function main() {
  console.log("Seeding educational content...");

  // Clear existing content
  await prisma.educationalContent.deleteMany();
  console.log("Cleared existing content ✓");

  // Insert all articles
  for (const article of articles) {
    await prisma.educationalContent.create({ data: article });
    console.log(`  "${article.title}" ✓`);
  }

  console.log(`\nAll done ✓ — ${articles.length} articles seeded`);

  // Summary by category
  const categories = [...new Set(articles.map((a) => a.category))];
  categories.forEach((cat) => {
    const count = articles.filter((a) => a.category === cat).length;
    console.log(`  ${cat}: ${count} articles`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
