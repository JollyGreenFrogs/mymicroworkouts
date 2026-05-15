// MicroWorkouts — Client-side application
// Evidence-based micro-workout planner with multiple programs, notifications and injury tracking.

'use strict';

// ============================================================
// WORKOUT DATA
// ============================================================

const INJURIES_CONFIG = [
  { key: 'knee',       label: 'Knee',       emoji: '🦵', desc: 'Runner\'s knee, surgery recovery, general pain' },
  { key: 'shoulder',   label: 'Shoulder',   emoji: '🦾', desc: 'Rotator cuff, impingement, post-surgery' },
  { key: 'lower-back', label: 'Lower Back', emoji: '🔙', desc: 'Herniated disc, muscle strain, sciatica' },
  { key: 'upper-back', label: 'Upper Back', emoji: '🔝', desc: 'Thoracic pain, muscle tension, trapezius strain' },
  { key: 'wrist',      label: 'Wrist',      emoji: '✋', desc: 'Carpal tunnel, sprain, tendinitis' },
  { key: 'elbow',      label: 'Elbow',      emoji: '💪', desc: 'Tennis/golfer\'s elbow, strain' },
  { key: 'hip',        label: 'Hip',        emoji: '🦴', desc: 'Hip flexor strain, bursitis' },
];

// Daily goals – amounts accumulate across all checked exercises
const DAILY_GOALS = {
  pushups: { label: 'Push-Ups', target: 100, unit: 'reps', displayTarget: '100 reps', emoji: '✊', color: '#FF3B30' },
  squats:  { label: 'Squats',   target: 100, unit: 'reps', displayTarget: '100 reps', emoji: '⬇️', color: '#34C759' },
  plank:   { label: 'Plank',    target: 180, unit: 'sec',  displayTarget: '3 min',    emoji: '⬛', color: '#5856D6' },
};

// ── Program definitions ─────────────────────────────────────
const PROGRAMS = {
  desk: {
    id:   'desk',
    name: 'Desk Worker',
    icon: '🖥️',
    desc: 'Designed for people who sit most of the day. All exercises can be done in office clothes with no equipment — chair, floor space and a desk are enough.',
    schedule: [
      {
        time: '9:00 AM', category: 'Wake-Up Mobility', emoji: '🌅', color: '#FF9500',
        notification: 'Good morning! Start your day with some mobility work.',
        exercises: [
          { name: 'Neck Rolls',     sets: 2, reps: '30 sec', emoji: '🔄', exclude: [],                   how: 'Sit tall. Slowly drop your right ear to your right shoulder, roll your chin to your chest, then to the left. Keep movements slow and gentle — never roll the head back.' },
          { name: 'Shoulder Rolls', sets: 2, reps: '30 sec', emoji: '🔄', exclude: ['shoulder'],          how: 'Sit or stand tall. Lift both shoulders up toward your ears, roll them back, then down and forward in a smooth circle. Reverse direction after 15 sec.' },
          { name: 'Hip Circles',    sets: 2, reps: '30 sec', emoji: '🔄', exclude: ['hip', 'lower-back'], how: 'Stand with feet shoulder-width apart, hands on hips. Draw large circles with your hips — like hula-hooping. Keep your upper body relatively still. Swap direction halfway.' },
          { name: 'Wrist Circles',  sets: 2, reps: '30 sec', emoji: '🔄', exclude: ['wrist'],             how: 'Extend both arms in front of you. Make loose fists and rotate your wrists in wide circles — 15 sec clockwise, 15 sec counter-clockwise.' },
          { name: 'Ankle Circles',  sets: 2, reps: '30 sec', emoji: '🔄', exclude: [],                   how: 'Sit and lift one foot off the floor. Rotate your ankle in full circles — 15 sec each direction — then swap feet.' },
        ],
      },
      {
        time: '10:30 AM', category: 'Push — Chest & Triceps', emoji: '💪', color: '#FF3B30',
        notification: 'Push time! 3 sets of push-ups — you\'ve got this!',
        exercises: [
          { name: 'Push-Ups',   sets: 3, reps: 15, emoji: '✊', goal: { key: 'pushups', amount: 45 }, exclude: ['shoulder', 'wrist'], how: 'Hands slightly wider than shoulders, body in a straight line. Lower chest to ~2 cm above the floor, elbows at roughly 45° to your torso. Press back up fully. Keep core tight throughout.' },
          { name: 'Chair Dips', sets: 3, reps: 12, emoji: '💺', goal: { key: 'pushups', amount: 36 }, exclude: ['shoulder', 'wrist', 'elbow'], how: 'Sit on the edge of a sturdy chair, hands gripping the front edge. Slide hips off, lower until elbows reach ~90°, then press back up. Keep back close to the chair.' },
        ],
        injuryAlternatives: {
          shoulder: [
            { name: 'Forearm Plank',  sets: 3, reps: '30 sec',  emoji: '⬛', goal: { key: 'plank', amount: 90 }, how: 'Prop on forearms and toes, elbows under shoulders. Lift hips to form a straight line. Squeeze glutes and abs — don\'t let hips sag.' },
            { name: 'Shoulder Taps',  sets: 3, reps: '20 each', emoji: '👆',                                     how: 'High plank. Lift one hand to tap the opposite shoulder, keeping hips as still as possible. Brace your core hard to resist rotation.' },
          ],
          wrist: [
            { name: 'Incline Push-Ups', sets: 3, reps: 15, emoji: '🔼', goal: { key: 'pushups', amount: 45 }, how: 'Hands on a desk or windowsill at hip height, body in a straight diagonal line. Same form as a floor push-up but easier on the wrists.' },
          ],
        },
      },
      {
        time: '12:30 PM', category: 'Legs', emoji: '🦵', color: '#34C759',
        notification: 'Stand up! Time for squats and lunges.',
        exercises: [
          { name: 'Air Squats',     sets: 3, reps: 20,        emoji: '⬇️', goal: { key: 'squats', amount: 60 }, exclude: ['knee'], how: 'Feet shoulder-width apart, toes slightly out. Push hips back and bend knees, keeping chest up and knees tracking over toes. Lower until thighs are parallel, drive through heels to stand.' },
          { name: 'Reverse Lunges', sets: 3, reps: '12 each', emoji: '🚶', exclude: ['knee'],                   how: 'Step one foot back and lower your rear knee toward the floor — both knees at roughly 90°. Front shin stays vertical. Push through the front heel to return.' },
          { name: 'Calf Raises',    sets: 3, reps: 20,        emoji: '⬆️', exclude: [],                         how: 'Rise onto the balls of both feet as high as possible, hold 1 sec at the top, then slowly lower. Stand on a step edge for greater range.' },
        ],
        injuryAlternatives: {
          knee: [
            { name: 'Seated Leg Raises',      sets: 3, reps: 15,  emoji: '🪑', how: 'Sit upright, back off the backrest. Straighten one leg until parallel to the floor, hold 2 sec, lower slowly. Alternate legs. Targets quads without knee bend.' },
            { name: 'Standing Hip Abduction', sets: 3, reps: 15,  emoji: '↔️', how: 'Hold a wall for balance. Keeping your leg straight, lift it out to the side as high as comfortable, then slowly lower. Do all reps on one side then switch.' },
            { name: 'Seated Calf Raises',     sets: 3, reps: 20,  emoji: '⬆️', how: 'Sit with feet flat on the floor. Raise both heels as high as possible, squeezing calves at the top, then lower.' },
          ],
        },
      },
      {
        time: '2:30 PM', category: 'Pull — Back & Biceps', emoji: '🏋️', color: '#007AFF',
        notification: 'Back to it! Time for pulling exercises.',
        exercises: [
          { name: 'Desk Rows',        sets: 3, reps: 12, emoji: '🪑', exclude: ['shoulder', 'upper-back'], how: 'Face your desk, grip the edge, lean back and pull your chest toward it by rowing your elbows back — squeeze shoulder blades together at the top. Slowly return. Works mid-back and biceps.' },
          { name: 'Band Pull-Aparts', sets: 3, reps: 15, emoji: '↔️', exclude: ['shoulder'],               how: 'Hold a resistance band (or folded towel) at shoulder height, arms straight. Pull it apart until arms are fully extended at your sides, squeezing shoulder blades together. Great for rear delts and posture.' },
          { name: 'Bicep Curls',      sets: 3, reps: 12, emoji: '💪', exclude: ['elbow', 'wrist'],          how: 'Hold a dumbbell or full water bottle in each hand, palms forward, elbows tucked to sides. Curl to shoulders without rocking. Lower slowly — 2 sec down.' },
        ],
      },
      {
        time: '4:30 PM', category: 'Core', emoji: '🔥', color: '#FF2D55',
        notification: 'Core time! Planks and crunches.',
        exercises: [
          { name: 'Plank',            sets: 3, reps: '30 sec',  emoji: '⬛', goal: { key: 'plank', amount: 90 }, exclude: ['wrist', 'lower-back'], how: 'Hands under shoulders, body a rigid straight line from head to heels. Squeeze glutes and brace abs. Breathe steadily — don\'t hold your breath.' },
          { name: 'Bicycle Crunches', sets: 3, reps: '20 each', emoji: '🚲', exclude: ['lower-back'],             how: 'On your back, hands lightly behind your head, legs at 45°. Bring right elbow and left knee together while straightening the right leg. Twist from the ribcage — not the neck. Alternate sides slowly.' },
          { name: 'Dead Bug',         sets: 3, reps: 10,         emoji: '🐛', exclude: ['lower-back'],             how: 'On your back, arms up to ceiling, hips and knees at 90°. Press lower back to floor and keep it there. Slowly lower right arm overhead and extend left leg simultaneously, then return. Alternate sides.' },
        ],
        injuryAlternatives: {
          wrist: [
            { name: 'Forearm Plank', sets: 3, reps: '30 sec', emoji: '⬛', goal: { key: 'plank', amount: 90 }, how: 'Same as the regular plank but resting on forearms — takes all load off the wrists. Keep hips in line with shoulders.' },
          ],
          'lower-back': [
            { name: 'Bird Dog',        sets: 3, reps: '10 each', emoji: '🐦', how: 'On hands and knees, wrists under shoulders. Brace core and extend right arm forward and left leg back simultaneously. Hold 2 sec, return. Don\'t rotate your hips.' },
            { name: 'Seated Crunches', sets: 3, reps: 20,         emoji: '🪑', how: 'Sit on the edge of a chair, hands on thighs. Lean back slightly until abs engage, hold 2 sec, sit back up. Hinge from the hips — don\'t round your upper back.' },
          ],
        },
      },
      {
        time: '6:30 PM', category: 'Shoulders & Arms', emoji: '🏅', color: '#5856D6',
        notification: 'Almost done — shoulders and arms!',
        exercises: [
          { name: 'Shoulder Press', sets: 3, reps: 12, emoji: '🔝', exclude: ['shoulder'], how: 'Dumbbells or water bottles at shoulder height, palms forward. Press straight up overhead until elbows nearly lock, lower slowly. Keep core braced — don\'t arch your lower back.' },
          { name: 'Lateral Raises', sets: 3, reps: 12, emoji: '↔️', exclude: ['shoulder'], how: 'Arms at sides, slight elbow bend. Raise both arms out to the sides until parallel to the floor, then lower slowly over 3 sec. Lead with your elbows, not your hands.' },
          { name: 'Push-Ups',       sets: 2, reps: 10, emoji: '✊', goal: { key: 'pushups', amount: 20 }, exclude: ['shoulder', 'wrist'], how: 'Standard push-up. Hands slightly wider than shoulders, elbows 45° to torso. Lower chest to near the floor and press back up.' },
          { name: 'Hammer Curls',   sets: 3, reps: 12, emoji: '🔨', exclude: ['elbow', 'wrist'],          how: 'Neutral grip (palms facing thighs). Curl both up simultaneously without rotating the wrists, elbows tucked. Targets brachialis more than standard curls.' },
        ],
        injuryAlternatives: {
          shoulder: [
            { name: 'Resistance Band Rows', sets: 3, reps: 15,        emoji: '↔️', how: 'Anchor a band to a door handle at waist height. Pull both handles to your hips by driving elbows back — squeeze shoulder blades at the end. Works mid-back with no overhead load.' },
            { name: 'Forearm Circles',      sets: 2, reps: '30 sec',  emoji: '🔄', how: 'Arms extended at shoulder height, palms down. Make small circles with just your forearms — 15 sec forward, 15 sec back. Keeps blood flowing with zero shoulder strain.' },
          ],
        },
      },
      {
        time: '8:00 PM', category: 'Cool Down & Stretch', emoji: '🧘', color: '#30D158',
        notification: 'Great work today! Time to cool down and stretch.',
        exercises: [
          { name: 'Full Body Stretch',      sets: 1, reps: '5 min',  emoji: '🧘', exclude: [],                    how: 'Flowing sequence: reach arms overhead, fold forward, walk to a plank, lower to cobra for a chest stretch, move into downward dog, walk feet to hands, roll up slowly. Move with your breath.' },
          { name: 'Chest Opener',           sets: 2, reps: '30 sec', emoji: '🤲', exclude: ['shoulder'],           how: 'Interlace fingers behind your back, straighten arms and gently lift them, rolling shoulders back and opening your chest upward. Breathe deeply into the front of your shoulders.' },
          { name: 'Pigeon Pose',            sets: 2, reps: '30 sec', emoji: '🦢', exclude: ['hip', 'knee'],        how: 'From a plank, bring right knee forward toward right wrist, extend left leg back. Sink hips toward the floor and fold forward over your right shin. Deep hip flexor and glute stretch. Swap sides.' },
          { name: "Child's Pose",           sets: 2, reps: '30 sec', emoji: '🙏', exclude: ['knee', 'lower-back'], how: 'Kneel, sit back on heels, fold forward with arms extended. Allow chest to sink toward the floor. Walk hands to one side for a lat stretch, then the other.' },
          { name: 'Standing Quad Stretch',  sets: 2, reps: '30 sec', emoji: '🦵', exclude: ['knee'],               how: 'Stand on one foot, pull the other heel toward your glute, knees together. Hold a wall if needed. Switch sides.' },
        ],
      },
    ],
  },

  home: {
    id:   'home',
    name: 'Home Workout',
    icon: '🏠',
    desc: 'Bodyweight training for your living room. No equipment needed beyond a chair, a table edge and some floor space. Full-body sessions that build real strength.',
    schedule: [
      {
        time: '7:00 AM', category: 'Morning Mobility', emoji: '🌅', color: '#FF9500',
        notification: 'Rise and move! Start the day with 5 minutes of mobility.',
        exercises: [
          { name: 'Cat-Cow',              sets: 2, reps: '30 sec', emoji: '🐱', exclude: ['lower-back', 'wrist'], how: 'On hands and knees, wrists under shoulders. Inhale and drop your belly toward the floor, lifting your head and tailbone (cow). Exhale and round your spine to the ceiling, tucking chin and pelvis (cat). Flow smoothly between the two.' },
          { name: 'Thoracic Rotations',   sets: 2, reps: '8 each', emoji: '🌀', exclude: ['upper-back'],          how: 'On hands and knees. Place one hand behind your head. Rotate your upper back, leading with the elbow — open the chest toward the ceiling. Return slowly. Only your thoracic spine moves; keep hips square.' },
          { name: 'Hip Flexor Stretch',   sets: 2, reps: '30 sec', emoji: '🦵', exclude: ['knee', 'hip'],         how: 'Kneel on one knee (kneeling lunge). Shift your hips forward until you feel a stretch at the front of the rear hip. Raise the arm on the kneeling side overhead to deepen it. Hold 30 sec, switch sides.' },
          { name: 'World\'s Greatest Stretch', sets: 1, reps: '5 each', emoji: '🌍', exclude: ['lower-back', 'hip', 'knee'], how: 'Start in a low lunge (right foot forward). Place left hand on the floor, right hand behind your head. Rotate your right elbow toward the ceiling. Hold 2 sec, then rotate it to the floor. Do 5 reps then swap sides.' },
        ],
      },
      {
        time: '9:30 AM', category: 'Upper Body Push', emoji: '💪', color: '#FF3B30',
        notification: 'Push session! Build chest, shoulders and triceps.',
        exercises: [
          { name: 'Push-Ups',          sets: 4, reps: 15, emoji: '✊', goal: { key: 'pushups', amount: 60 }, exclude: ['shoulder', 'wrist'], how: 'Hands slightly wider than shoulders. Lower chest to near the floor, elbows at ~45° to your torso. Press fully back up. Core stays rigid the whole time.' },
          { name: 'Diamond Push-Ups',  sets: 3, reps: 10, emoji: '💎', goal: { key: 'pushups', amount: 30 }, exclude: ['shoulder', 'wrist', 'elbow'], how: 'Form a diamond shape with your thumbs and index fingers under your chest. Keep elbows pointing back as you lower — heavily targets triceps and inner chest.' },
          { name: 'Pike Push-Ups',     sets: 3, reps: 10, emoji: '🔼', goal: { key: 'pushups', amount: 30 }, exclude: ['shoulder', 'wrist'], how: 'Start in downward dog (hips high, forming an upside-down V). Bend your elbows to lower the top of your head toward the floor between your hands. Press back up. Targets the shoulders like an overhead press.' },
          { name: 'Tricep Dips',       sets: 3, reps: 12, emoji: '💺', goal: { key: 'pushups', amount: 36 }, exclude: ['shoulder', 'wrist', 'elbow'], how: 'Grip the edge of a chair or low table, legs extended. Lower until elbows reach 90°, then press back up. Keep your back close to the surface and shoulders down.' },
        ],
        injuryAlternatives: {
          shoulder: [
            { name: 'Forearm Plank Hold', sets: 4, reps: '30 sec', emoji: '⬛', goal: { key: 'plank', amount: 120 }, how: 'On forearms and toes. Body in a straight line. Squeeze glutes and abs. Build up to longer holds as you get stronger.' },
          ],
          wrist: [
            { name: 'Incline Push-Ups', sets: 4, reps: 15, emoji: '🔼', goal: { key: 'pushups', amount: 60 }, how: 'Hands on a table or windowsill. Same form as floor push-ups but hands elevated, reducing wrist angle and joint stress.' },
          ],
        },
      },
      {
        time: '12:30 PM', category: 'Legs & Glutes', emoji: '🦵', color: '#34C759',
        notification: 'Leg day! Squats, glute bridges and lunges.',
        exercises: [
          { name: 'Squats',         sets: 4, reps: 20, emoji: '⬇️', goal: { key: 'squats', amount: 80 }, exclude: ['knee'], how: 'Feet shoulder-width apart, toes out slightly. Hips back and down, chest up, knees track over toes. Drive through heels to stand. Pause 1 sec at the bottom for extra muscle recruitment.' },
          { name: 'Glute Bridges',  sets: 3, reps: 20, emoji: '🌉', exclude: ['lower-back', 'hip'],       how: 'Lie on your back, knees bent, feet flat. Squeeze glutes and drive hips straight up until your body forms a straight line from knees to shoulders. Hold 1 sec at the top, lower slowly. Great hip extension exercise with no spine load.' },
          { name: 'Walking Lunges', sets: 3, reps: '10 each', emoji: '🚶', exclude: ['knee'],              how: 'Step forward into a lunge, lower back knee close to the floor, then step the rear foot forward and lunge with the other leg. Move continuously down the room, or do stationary reverse lunges if space is limited.' },
          { name: 'Wall Sit',       sets: 3, reps: '30 sec', emoji: '🧱', exclude: ['knee'],               how: 'Back flat against a wall, slide down until thighs are parallel to the floor and knees are at 90°. Keep feet flat and don\'t let knees drift inward. Builds quad endurance and burns — hold as long as possible.' },
        ],
        injuryAlternatives: {
          knee: [
            { name: 'Glute Bridges',      sets: 4, reps: 20, emoji: '🌉', how: 'Lie on back, knees bent, feet flat. Drive hips up squeezing glutes, hold 1 sec, lower. Zero knee stress.' },
            { name: 'Donkey Kicks',       sets: 3, reps: '15 each', emoji: '🐴', how: 'On hands and knees. Keeping knee bent at 90°, kick one leg up toward the ceiling, squeezing the glute at the top. Return without letting the knee touch the floor. Isolates glute max with no knee load.' },
            { name: 'Lying Hip Circles',  sets: 2, reps: '10 each', emoji: '🔄', how: 'On your side, bottom leg straight. Draw slow large circles with your top leg — keeps hip joint mobile without knee stress.' },
          ],
        },
      },
      {
        time: '3:30 PM', category: 'Pull & Back', emoji: '🏋️', color: '#007AFF',
        notification: 'Back strength! Use your table for rows.',
        exercises: [
          { name: 'Inverted Rows',       sets: 4, reps: 10, emoji: '🪑', exclude: ['shoulder', 'upper-back'], how: 'Lie under a sturdy table or desk. Grip the edge with both hands, body straight. Pull your chest up to the underside of the table by rowing your elbows back, squeezing shoulder blades. Lower slowly. The more horizontal your body, the harder it is.' },
          { name: 'Superman Hold',       sets: 3, reps: '10 (3 sec)', emoji: '🦸', exclude: ['lower-back'],   how: 'Lie face down, arms extended overhead. Simultaneously lift your arms, chest and legs off the floor, squeezing your glutes and back muscles. Hold 3 sec, then lower. Builds the entire posterior chain.' },
          { name: 'Doorframe Pulls',     sets: 3, reps: 12, emoji: '🚪', exclude: ['shoulder'],               how: 'Stand in a doorframe, grip both sides at shoulder height. Lean back until arms are almost straight, then pull your chest to the frame by drawing elbows back. Keep feet close to the door for more difficulty.' },
          { name: 'Towel Bicep Curls',   sets: 3, reps: 12, emoji: '🧺', exclude: ['elbow', 'wrist'],         how: 'Loop a towel around a door handle. Hold both ends, step back until there\'s tension. Curl your hands toward your shoulders against the resistance, keeping elbows tucked. Control the eccentric (lowering) phase.' },
        ],
        injuryAlternatives: {
          shoulder: [
            { name: 'Scapular Squeezes', sets: 3, reps: '15 (2 sec hold)', emoji: '🦋', how: 'Stand tall. Pull your shoulder blades together and down as if squeezing a pencil between them. Hold 2 sec then release. Builds mid-back posture muscles safely.' },
          ],
        },
      },
      {
        time: '6:00 PM', category: 'Core', emoji: '🔥', color: '#FF2D55',
        notification: 'Core blast! Last strength session of the day.',
        exercises: [
          { name: 'Plank',              sets: 3, reps: '40 sec', emoji: '⬛', goal: { key: 'plank', amount: 120 }, exclude: ['wrist', 'lower-back'], how: 'High plank: hands under shoulders, body rigid from head to heels. Brace abs and glutes. Push the floor away — don\'t let shoulders collapse.' },
          { name: 'Mountain Climbers',  sets: 3, reps: '20 each', emoji: '🧗', exclude: ['wrist', 'lower-back'],  how: 'High plank position. Drive one knee toward your chest, then quickly switch legs. Keep hips down — don\'t bounce them up. The faster you go, the more cardio benefit you get.' },
          { name: 'Side Plank',         sets: 3, reps: '25 sec each', emoji: '◀️', exclude: ['wrist', 'shoulder'], how: 'Lie on your side, prop on one forearm. Lift your hips until body forms a straight line from head to feet. Stack feet or stagger them. Hold, then swap sides. Works the obliques and hip abductors.' },
          { name: 'Hollow Body Hold',   sets: 3, reps: '20 sec',  emoji: '🍌', exclude: ['lower-back'],           how: 'Lie on your back, arms extended overhead. Press your lower back firmly into the floor. Lift your shoulder blades and legs off the floor simultaneously, holding the "hollow" shape. This is the foundation of gymnastics core strength.' },
        ],
        injuryAlternatives: {
          wrist: [{ name: 'Forearm Plank', sets: 3, reps: '40 sec', emoji: '⬛', goal: { key: 'plank', amount: 120 }, how: 'On forearms and toes. Same rigid body position but takes all load off the wrists.' }],
          'lower-back': [
            { name: 'Dead Bug', sets: 3, reps: 12, emoji: '🐛', how: 'On back, arms up, hips and knees at 90°. Press lower back to floor. Lower opposite arm and leg simultaneously, return slowly. Alternate sides.' },
            { name: 'Bird Dog', sets: 3, reps: '10 each', emoji: '🐦', how: 'On hands and knees. Extend opposite arm and leg, hold 2 sec, return. Keep hips square to the floor throughout.' },
          ],
        },
      },
      {
        time: '8:00 PM', category: 'Cool Down & Stretch', emoji: '🧘', color: '#30D158',
        notification: 'Excellent work! Time to recover and stretch.',
        exercises: [
          { name: 'Hamstring Stretch',     sets: 2, reps: '40 sec each', emoji: '🦵', exclude: ['lower-back'],        how: 'Lie on your back. Loop a towel around one foot and straighten the leg toward the ceiling until you feel a stretch behind the thigh. Hold — don\'t bounce. Swap sides.' },
          { name: 'Pigeon Pose',           sets: 2, reps: '40 sec each', emoji: '🦢', exclude: ['hip', 'knee'],       how: 'From a plank, bring one knee forward toward the same-side wrist, extend the other leg back. Sink hips and fold forward over your shin. Deep hip flexor and glute stretch.' },
          { name: 'Doorframe Chest Stretch', sets: 2, reps: '30 sec each', emoji: '🤲', exclude: ['shoulder'],        how: 'Stand in a doorframe, arm bent at 90° against the frame at shoulder height. Gently step one foot through until you feel a stretch across your chest and front shoulder. Hold, then switch sides.' },
          { name: "Child's Pose",          sets: 2, reps: '40 sec',      emoji: '🙏', exclude: ['knee', 'lower-back'], how: 'Kneel and fold forward, arms extended. Allow your chest to sink toward the floor. Walk hands to each side for a lat stretch.' },
        ],
      },
    ],
  },

  gym: {
    id:   'gym',
    name: 'Gym',
    icon: '🏋️',
    desc: 'Full gym access program. Barbells, dumbbells, cables and machines. Classic push/pull/legs split with cardio built in. Scales from beginner to intermediate.',
    schedule: [
      {
        time: '7:00 AM', category: 'Cardio Warm-Up', emoji: '🏃', color: '#FF9500',
        notification: 'Time to warm up! 10 minutes of cardio before lifting.',
        exercises: [
          { name: 'Treadmill / Bike',       sets: 1, reps: '10 min', emoji: '🏃', exclude: ['knee'], how: 'Easy effort — you should be able to hold a conversation. This primes the cardiovascular system and raises muscle temperature before heavy lifting. Incline walk on treadmill or moderate resistance on the bike.' },
          { name: 'Dynamic Leg Swings',     sets: 2, reps: '12 each', emoji: '🦵', exclude: ['hip', 'knee'],         how: 'Hold a fixed bar for balance. Swing one leg forward and back through a full range of motion, gradually increasing amplitude. Then swing side to side. Mobilises hip flexors and hamstrings before lower body work.' },
          { name: 'Band Shoulder Warm-Up',  sets: 2, reps: '15', emoji: '↔️', exclude: ['shoulder'],                 how: 'Loop a light band around both wrists. Perform pull-aparts, overhead raises and external rotations. Activates the rotator cuff before pressing movements.' },
        ],
      },
      {
        time: '10:00 AM', category: 'Chest & Shoulders', emoji: '💪', color: '#FF3B30',
        notification: 'Push day! Bench press and shoulder work.',
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '5–8', emoji: '🏋️', goal: { key: 'pushups', amount: 30 }, exclude: ['shoulder', 'wrist'], how: 'Lie on the bench, feet flat on the floor. Grip bar just outside shoulder width. Lower bar to mid-chest with elbows at ~45–75°. Press back up to lockout. Drive your feet into the floor for stability.' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: 10, emoji: '🔼', goal: { key: 'pushups', amount: 30 }, exclude: ['shoulder', 'wrist'], how: 'Bench at 30–45°. Start with dumbbells at chest height, palms facing forward. Press up and together — slightly arc the path in. Lower under control. Targets upper chest more than flat bench.' },
          { name: 'Cable Flyes',         sets: 3, reps: 12, emoji: '↔️', goal: { key: 'pushups', amount: 36 }, exclude: ['shoulder'], how: 'Set cables at chest height. Step forward, arms wide. With a slight elbow bend, sweep arms together in front of your chest as if hugging a barrel. Squeeze the inner chest at the peak. Open slowly.' },
          { name: 'Overhead Press',      sets: 3, reps: 10, emoji: '🔝', exclude: ['shoulder'],                how: 'Standing or seated, barbell or dumbbells at shoulder height. Press straight up overhead until elbows lock. Lower slowly. Keep core braced — avoid an excessive lower-back arch.' },
        ],
        injuryAlternatives: {
          shoulder: [
            { name: 'Landmine Press', sets: 3, reps: 10, emoji: '💥', how: 'One end of a barbell is fixed to the floor (or a landmine attachment). Stand facing it, grip the loaded end with one hand at shoulder height, press it forward and up along its arc. The angled pressing motion is much easier on the shoulder joint than vertical pressing.' },
          ],
          wrist: [
            { name: 'Machine Chest Press', sets: 4, reps: 10, emoji: '🪑', goal: { key: 'pushups', amount: 40 }, how: 'Use a chest press machine with neutral-grip handles to remove wrist strain. Adjust seat so handles align with mid-chest. Press fully and control the return.' },
          ],
        },
      },
      {
        time: '12:30 PM', category: 'Back & Biceps', emoji: '🏋️', color: '#007AFF',
        notification: 'Pull session! Back and biceps time.',
        exercises: [
          { name: 'Lat Pulldown',       sets: 4, reps: 10, emoji: '⬇️', exclude: ['shoulder', 'upper-back'], how: 'Sit at the lat pulldown machine, thighs under the pad, wide overhand grip. Pull the bar to your upper chest by driving your elbows down toward your hips — lead with the elbows, not the hands. Lean back slightly at the bottom. Return under control.' },
          { name: 'Seated Cable Row',   sets: 3, reps: 12, emoji: '↔️', exclude: ['lower-back'],              how: 'Sit upright with a neutral spine on the cable row bench, feet on the platform, slight knee bend. Pull the handle to your lower chest / upper abs, driving elbows back and squeezing shoulder blades together at the end. Return with arms fully extended.' },
          { name: 'Dumbbell Row',       sets: 3, reps: 12, emoji: '💪', exclude: ['lower-back', 'upper-back'], how: 'Place one knee and hand on a bench, other foot on the floor. Let the dumbbell hang straight down. Row it to your hip, driving your elbow up and back. Keep your torso parallel to the floor — don\'t twist.' },
          { name: 'EZ Bar Curls',       sets: 3, reps: 12, emoji: '🦾', exclude: ['elbow', 'wrist'],           how: 'Stand with EZ bar, wide angled grip. Curl from full extension to the top without swinging. Squeeze hard at the top, lower over 3 sec. The angled grip reduces wrist strain versus a straight bar.' },
        ],
        injuryAlternatives: {
          'lower-back': [
            { name: 'Chest-Supported Row', sets: 4, reps: 12, emoji: '🪑', how: 'Set an incline bench to ~45°. Lie face-down on it, chest resting on the pad. Row dumbbells to your sides — your torso is supported so there\'s zero lower-back loading.' },
          ],
        },
      },
      {
        time: '3:00 PM', category: 'Legs', emoji: '🦵', color: '#34C759',
        notification: 'Leg day! The big one — squats and deadlifts.',
        exercises: [
          { name: 'Barbell Squat',    sets: 4, reps: '5–8', emoji: '⬇️', goal: { key: 'squats', amount: 30 }, exclude: ['knee', 'lower-back'], how: 'Bar across upper traps (high bar) or rear delts (low bar). Unrack, brace your core hard, descent by breaking at the hips first, knees tracking over toes. Reach depth (thighs parallel or below), then drive through the whole foot to stand.' },
          { name: 'Leg Press',        sets: 3, reps: 12,    emoji: '🪑', goal: { key: 'squats', amount: 36 }, exclude: ['knee'],               how: 'Sit in the machine, feet shoulder-width on the platform at mid-height. Lower the sled until knees reach ~90° (not past your toes in side view). Press through the whole foot. Never lock knees aggressively at the top.' },
          { name: 'Romanian Deadlift', sets: 3, reps: 10,   emoji: '🏋️', exclude: ['lower-back', 'hip'],      how: 'Hold a barbell in front of your thighs. Hinge at the hips (push your butt back), keeping a slight knee bend and neutral spine, lowering the bar along your legs until you feel a stretch in your hamstrings (usually mid-shin). Drive hips forward to stand.' },
          { name: 'Calf Press',       sets: 4, reps: 20,    emoji: '⬆️', exclude: [],                          how: 'On the leg press machine or a standing calf raise station. Rise as high as possible onto the balls of your feet, pause 1 sec at the top, then lower the heels below the platform level for a full stretch. Calves respond well to high reps.' },
        ],
        injuryAlternatives: {
          knee: [
            { name: 'Hip Thrust',      sets: 4, reps: 12, emoji: '🌉', how: 'Sit with upper back against a bench, barbell across hips. Plant feet, squeeze glutes and drive hips up to a straight line from knees to shoulders. Lower and repeat. Maximum glute activation with zero knee-bending load.' },
            { name: 'Leg Curl',        sets: 3, reps: 12, emoji: '🪑', how: 'On the lying leg curl machine, curl your heels toward your glutes. Control the return. Hamstring isolation with minimal knee joint stress.' },
          ],
          'lower-back': [
            { name: 'Hack Squat',      sets: 4, reps: 10, emoji: '🔁', goal: { key: 'squats', amount: 40 }, how: 'On the hack squat machine. The back pad supports your spine throughout, removing almost all lower-back stress while still loading the quads hard.' },
          ],
        },
      },
      {
        time: '5:30 PM', category: 'Core & Accessories', emoji: '🔥', color: '#FF2D55',
        notification: 'Finishing strong — core and isolation work.',
        exercises: [
          { name: 'Cable Crunches',     sets: 3, reps: 15, emoji: '🔗', goal: { key: 'plank', amount: 0 },  exclude: ['lower-back'],             how: 'Kneel in front of a cable stack with a rope attachment at the top. Hold the rope at the sides of your head. Crunch forward, rounding your spine — pull your elbows toward your knees. The weight loads the abs through the full range unlike floor crunches.' },
          { name: 'Ab Wheel Rollout',   sets: 3, reps: 8,  emoji: '🛞', goal: { key: 'plank', amount: 60 }, exclude: ['lower-back', 'wrist'],     how: 'Kneel on a mat, hold the ab wheel under your shoulders. Roll forward slowly, keeping abs braced and lower back from sagging. Roll out as far as you can control, then pull back. One of the most effective core exercises.' },
          { name: 'Face Pulls',         sets: 3, reps: 15, emoji: '↩️', exclude: ['shoulder'],               how: 'Cable set at eye height, rope attachment. Pull the rope toward your face, separating the handles as they reach you — elbows high and wide. Squeezes rear delts and rotator cuff. Essential for shoulder health if you do a lot of pressing.' },
          { name: 'Tricep Pushdown',    sets: 3, reps: 12, emoji: '⬇️', exclude: ['elbow', 'wrist'],         how: 'Cable stack, rope or bar attachment at the top. Elbows pinned to your sides, push the attachment down to full extension. Squeeze the triceps at the bottom. Elbows must not flare out.' },
        ],
        injuryAlternatives: {
          'lower-back': [
            { name: 'Plank', sets: 3, reps: '40 sec', emoji: '⬛', goal: { key: 'plank', amount: 120 }, how: 'High plank: hands under shoulders, body rigid. Brace abs and glutes. Safe for the lower back when performed correctly.' },
          ],
        },
      },
      {
        time: '8:00 PM', category: 'Cool Down & Stretch', emoji: '🧘', color: '#30D158',
        notification: 'Great lifting session! Stretch and recover.',
        exercises: [
          { name: 'Foam Roll Quads & IT Band', sets: 1, reps: '2 min', emoji: '🧻', exclude: ['knee'], how: 'Lie on the foam roller with it under one quad (front of thigh). Slowly roll from hip to just above the knee, pausing on tight spots for 5–10 sec. Then move to the outer thigh for the IT band. Both sides.' },
          { name: 'Couch Stretch',             sets: 2, reps: '40 sec each', emoji: '🛋️', exclude: ['knee', 'hip'], how: 'Kneel in front of a couch or wall. Place the top of one foot against the couch behind you (like a kneeling hip flexor stretch, but with the back foot elevated). Upright torso and squeeze the glute of the rear leg. One of the best hip flexor stretches.' },
          { name: 'Cross-Body Shoulder Stretch', sets: 2, reps: '30 sec each', emoji: '🤗', exclude: ['shoulder'], how: 'Pull one arm across your chest with the other arm. Keep the shoulder of the working arm down. Feel the stretch in the posterior deltoid and upper back.' },
          { name: 'Spinal Twist',              sets: 2, reps: '30 sec each', emoji: '🌀', exclude: ['lower-back'], how: 'Lie on your back, bend one knee and let it fall across your body to the opposite side. Extend the same-side arm out and look away from the knee. Breathe deeply. Relieves spinal compression after heavy lifting.' },
        ],
      },
    ],
  },

  runner: {
    id:   'runner',
    name: 'Runner',
    icon: '🏃',
    desc: 'Built around running. Strength and mobility sessions are timed to support your runs — building the hips, glutes and calves that keep you injury-free.',
    schedule: [
      {
        time: '6:00 AM', category: 'Morning Run', emoji: '🏃', color: '#FF9500',
        notification: 'Morning run time! Lace up.',
        exercises: [
          { name: 'Easy Run / Walk',    sets: 1, reps: '20–30 min', emoji: '🏃', exclude: ['knee', 'hip'], how: 'Conversational pace — you should be able to speak in full sentences. Heart rate roughly 65–75% max. This is your aerobic base session. On off days swap for a brisk walk.' },
          { name: 'Strides',            sets: 4, reps: '20 sec', emoji: '💨', exclude: ['knee'],            how: 'After your easy run, do 4 × 20-second accelerations to roughly 90% effort. Start slow, reach near-top speed by 10 sec, then ease off. Full recovery between each. Builds leg speed without fatigue.' },
          { name: 'Running Drills',     sets: 2, reps: '30 m', emoji: '🎽', exclude: ['knee', 'hip'],       how: 'High knees (drive knees to hip height), butt kicks (heels to glutes) and A-skips (exaggerated marching with a skip). Each drill for 30 m before and after your run. Improves form and warm up the running muscles.' },
        ],
      },
      {
        time: '9:00 AM', category: 'Running Strength — Hips & Glutes', emoji: '💪', color: '#FF3B30',
        notification: 'Strength work to power your running and prevent injury.',
        exercises: [
          { name: 'Single-Leg Glute Bridge', sets: 3, reps: '12 each', emoji: '🌉', exclude: ['lower-back', 'hip'],  how: 'Lie on your back, one knee bent foot flat, other leg extended. Drive hips up through the bent leg, squeezing the glute hard at the top. Don\'t let the pelvis tilt to the unsupported side. Lower and repeat.' },
          { name: 'Bulgarian Split Squat',   sets: 3, reps: '10 each', emoji: '🧱', exclude: ['knee', 'hip'],        how: 'Stand a stride in front of a chair. Place the top of your rear foot on the seat. Lower your rear knee toward the floor, keeping your front shin vertical. Drive through the front heel to stand. Brutal for quads and glutes.' },
          { name: 'Clamshells',              sets: 3, reps: '15 each', emoji: '🦀', exclude: ['hip'],                how: 'Lie on your side, hips and knees bent at 45°. Keeping feet together, open the top knee like a clamshell. Resist using your hip flexors — the glute med should initiate the movement. Close slowly. Essential for IT band and knee tracking issues.' },
          { name: 'Nordic Hamstring Curl',   sets: 3, reps: 6,         emoji: '🌊', exclude: ['knee', 'lower-back'], how: 'Kneel on a mat and anchor your feet under something heavy (a sofa, door, or have someone hold them). Slowly lower your torso toward the floor as far as you can control. Catch yourself with your hands, then use hands to push partway back and pull yourself up with your hamstrings. Highly effective hamstring injury prevention.' },
        ],
        injuryAlternatives: {
          knee: [
            { name: 'Glute Bridge', sets: 4, reps: 20, emoji: '🌉', how: 'Both feet flat on the floor, drive hips up, squeeze glutes. Zero knee stress.' },
            { name: 'Fire Hydrant', sets: 3, reps: '15 each', emoji: '🚒', how: 'On hands and knees. Lift one knee out to the side while keeping it bent — like a dog at a fire hydrant. Works glute med without knee loading.' },
          ],
        },
      },
      {
        time: '12:00 PM', category: 'Core — Runner\'s Core', emoji: '🔥', color: '#FF2D55',
        notification: 'Core session — stability for your running.',
        exercises: [
          { name: 'Dead Bug',        sets: 3, reps: 12,         emoji: '🐛', exclude: ['lower-back'],             how: 'On your back, arms up, hips and knees at 90°. Press lower back to floor throughout. Lower opposite arm and leg slowly, return slowly. The go-to core exercise for runners — builds anti-extension stability.' },
          { name: 'Bird Dog',        sets: 3, reps: '10 each',  emoji: '🐦', exclude: ['wrist', 'lower-back'],    how: 'On hands and knees. Extend opposite arm and leg until both are parallel to the floor. Hold 2 sec. Keep hips square and don\'t rotate. Builds the lateral stability needed for single-leg running gait.' },
          { name: 'Side Plank',      sets: 3, reps: '25 sec each', emoji: '◀️', exclude: ['wrist', 'shoulder'],  how: 'On one forearm, body in a straight line. Hips up. Holds the glute med and obliques that stabilise your pelvis through each running stride.' },
          { name: 'Copenhagen Plank', sets: 3, reps: '20 sec each', emoji: '↔️', exclude: ['hip', 'knee'],       how: 'Lie on your side. Place your top foot on a bench or chair and lift your hips. Hold. One of the most effective exercises for hip adductor strength, which runners often neglect.' },
        ],
        injuryAlternatives: {
          wrist: [{ name: 'Forearm Side Plank', sets: 3, reps: '25 sec each', emoji: '◀️', how: 'On forearm (elbow directly under shoulder), feet stacked. Lift hips and hold. Removes wrist load while keeping the anti-lateral-flexion benefit.' }],
        },
      },
      {
        time: '4:00 PM', category: 'Upper Body & Posture', emoji: '🏋️', color: '#007AFF',
        notification: 'Upper body maintenance — keep your running posture strong.',
        exercises: [
          { name: 'Push-Ups',         sets: 3, reps: 15, emoji: '✊', goal: { key: 'pushups', amount: 45 }, exclude: ['shoulder', 'wrist'], how: 'Standard push-up. Maintains arm drive mechanics for running and prevents hunching.' },
          { name: 'Band Pull-Aparts', sets: 3, reps: 20, emoji: '↔️', exclude: ['shoulder'],               how: 'Hold a light band at shoulder height and pull it apart until fully extended. Works rear delts — counters the forward-hunched posture that runners develop.' },
          { name: 'Y-T-W Raises',     sets: 3, reps: '8 each', emoji: '✈️', exclude: ['shoulder'],         how: 'Lie face down on the floor (or incline bench). Raise straight arms to form a Y (overhead), then T (out to the sides), then W (elbows bent 90° at shoulder height). All three positions held 2 sec. Builds the small back muscles crucial for upright running posture.' },
          { name: 'Chin-Tucks',       sets: 3, reps: 15, emoji: '🤔', exclude: [],                          how: 'Stand or sit. Without moving your shoulders, draw your chin straight back (making a double chin). Hold 3 sec. Resets forward-head posture that accumulates during long runs.' },
        ],
      },
      {
        time: '6:30 PM', category: 'Mobility & Recovery', emoji: '🧘', color: '#5856D6',
        notification: 'Mobility time — key stretches for runners.',
        exercises: [
          { name: 'Hip Flexor Lunge Stretch',  sets: 2, reps: '45 sec each', emoji: '🦵', exclude: ['knee', 'hip'],   how: 'Low lunge, rear knee on the floor. Shift your hips forward and squeeze the rear glute until you feel a stretch at the front of the rear hip. Raise the same-side arm overhead to deepen. One of the most important stretches for runners who sit during the day.' },
          { name: 'Figure-4 Stretch',          sets: 2, reps: '40 sec each', emoji: '4️⃣', exclude: ['hip', 'knee'],  how: 'Lie on your back. Cross one ankle over the opposite knee (forming a "4"). Clasp hands behind the lower thigh and draw it toward your chest. Stretches piriformis and deep glutes — a common site of sciatica-like symptoms in runners.' },
          { name: 'Calf & Achilles Stretch',   sets: 2, reps: '45 sec each', emoji: '🦶', exclude: [],               how: 'Stand facing a wall. Back foot planted, front foot 30 cm from the wall. Straight rear leg = gastrocnemius stretch. Then bend the rear knee slightly = soleus and Achilles tendon stretch. Do both variations on each side.' },
          { name: 'IT Band Foam Roll',          sets: 1, reps: '90 sec each', emoji: '🧻', exclude: ['knee'],         how: 'Place the foam roller under the outer thigh. Roll slowly from hip to just above the knee. Pause on tight spots for 5–10 sec. The IT band itself can\'t be stretched, but rolling the TFL and quad that feeds into it provides relief.' },
          { name: 'Doorframe Chest Stretch',   sets: 2, reps: '30 sec each', emoji: '🤲', exclude: ['shoulder'],      how: 'Stand in a doorframe, arm at 90° against the frame. Step through gently until you feel a stretch across the chest and front shoulder. Counters the forward-shoulder position that running can reinforce.' },
        ],
      },
      {
        time: '8:30 PM', category: 'Sleep Prep', emoji: '🌙', color: '#30D158',
        notification: 'Wind down. Quality sleep = quality recovery.',
        exercises: [
          { name: "Child's Pose",          sets: 2, reps: '40 sec', emoji: '🙏', exclude: ['knee', 'lower-back'], how: 'Kneel, fold forward, arms extended. Let your chest sink toward the floor. Walk hands to each side for a lateral lat stretch.' },
          { name: 'Legs Up the Wall',      sets: 1, reps: '5 min',  emoji: '🧱', exclude: ['lower-back'],         how: 'Lie on your back and extend both legs up a wall (or prop them on a sofa cushion). This reverses blood pooling in the legs from running and promotes parasympathetic recovery. Great before sleep.' },
          { name: 'Diaphragmatic Breathing', sets: 1, reps: '2 min', emoji: '😮‍💨', exclude: [],                 how: 'Lie on your back, one hand on your chest and one on your belly. Breathe in through your nose for 4 counts, directing air into your belly (bottom hand rises, top hand stays still). Out through your mouth for 6 counts. Activates the rest-and-digest system.' },
        ],
      },
    ],
  },
};

function getSchedule() {
  const id = localStorage.getItem('program') || 'desk';
  return (PROGRAMS[id] || PROGRAMS.desk).schedule;
}

function getActiveProgram() {
  const id = localStorage.getItem('program') || 'desk';
  return PROGRAMS[id] || PROGRAMS.desk;
}

function setActiveProgram(id) {
  localStorage.setItem('program', id);
}

// ============================================================
// EXERCISE IMAGE LOOKUP
// Uses yuhonas/free-exercise-db (GitHub Pages, public read-only dataset)
// ============================================================

const EXERCISE_DB_URL = 'https://yuhonas.github.io/free-exercise-db/exercises.json';
const EXERCISE_IMG_BASE = 'https://yuhonas.github.io/free-exercise-db/exercises/';
let _exDb = null;       // null = not loaded, {} = loaded (may be empty on error)
let _exDbLoading = null; // in-flight promise

// Normalise a name to a comparable key
function _exKey(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

async function _loadExDb() {
  if (_exDb) return _exDb;
  if (_exDbLoading) return _exDbLoading;
  _exDbLoading = fetch(EXERCISE_DB_URL)
    .then(r => r.json())
    .then(data => {
      _exDb = {};
      data.forEach(ex => {
        if (!ex.images || !ex.images.length) return;
        const key = _exKey(ex.name);
        if (!_exDb[key]) _exDb[key] = EXERCISE_IMG_BASE + ex.images[0];
      });
      return _exDb;
    })
    .catch(() => { _exDb = {}; return _exDb; });
  return _exDbLoading;
}

async function getExerciseImageUrl(name) {
  const db = await _loadExDb();
  const needle = _exKey(name);
  // 1. exact
  if (db[needle]) return db[needle];
  // 2. db key contains our name (e.g. "push ups" in "dumbbell push ups")
  const keys = Object.keys(db);
  let hit = keys.find(k => k === needle);
  // 3. our name contains a db key word sequence
  if (!hit) hit = keys.find(k => needle.includes(k) && k.length > 5);
  // 4. db key starts with our first word(s)
  if (!hit) {
    const words = needle.split(' ');
    if (words.length >= 2) {
      const prefix = words.slice(0, 2).join(' ');
      hit = keys.find(k => k.startsWith(prefix));
    }
  }
  // 5. any db key that contains our first significant word
  if (!hit) {
    const firstWord = needle.split(' ').find(w => w.length > 4);
    if (firstWord) hit = keys.find(k => k.includes(firstWord));
  }
  return hit ? db[hit] : null;
}

// Pre-warm the DB quietly on page load (background)
function prefetchExerciseDb() { _loadExDb(); }

// ============================================================
// STATE
// ============================================================

let currentUser     = null;
let workoutData     = {};    // "DayName|SlotTime|ExerciseName" → boolean
let activeInjuries  = new Set();
let notifPermission = 'default';
let notifInterval   = null;
let countdownTimer  = null;

// ============================================================
// HELPERS
// ============================================================

function getWeekStart() {
  const d   = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function getCurrentDayName() {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
}

function parseTimeToMinutes(timeStr) {
  const [time, mer] = timeStr.split(' ');
  let [h, m]        = time.split(':').map(Number);
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h  = 0;
  return h * 60 + m;
}

function currentMinutes() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

function currentSeconds() {
  const n = new Date();
  return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds();
}

function safeNotificationPermission() {
  try {
    return window.Notification ? Notification.permission : 'unsupported';
  } catch (_) {
    return 'unsupported';
  }
}

// Return exercises for a slot taking active injuries into account.
// Excluded exercises are replaced with injury-specific alternatives when available.
function getEffectiveExercises(slot) {
  const isExcluded = (ex) => ex.exclude && ex.exclude.some(k => activeInjuries.has(k));

  const kept     = slot.exercises.filter(ex => !isExcluded(ex));
  const excluded = slot.exercises.filter(ex =>  isExcluded(ex));

  if (!excluded.length || !slot.injuryAlternatives) return kept;

  const alts   = [];
  const seen   = new Set();

  for (const injKey of activeInjuries) {
    const candidates = slot.injuryAlternatives[injKey];
    if (!candidates) continue;
    // Only add alternatives when this injury actually excluded something
    const triggered = excluded.some(ex => ex.exclude.includes(injKey));
    if (!triggered) continue;

    candidates.forEach(alt => {
      const altExcluded = alt.exclude && alt.exclude.some(k => activeInjuries.has(k));
      if (!seen.has(alt.name) && !altExcluded) {
        alts.push({ ...alt, isAlternative: true });
        seen.add(alt.name);
      }
    });
  }

  return [...kept, ...alts];
}

// ============================================================
// AUTH
// ============================================================

// Return the stored JWT, or null if absent / expired
function getStoredToken() {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem('auth_token');
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

// Headers to attach to every authenticated API call
function authHeaders() {
  const token = getStoredToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function checkAuth() {
  const token = getStoredToken();
  if (!token) return false;
  try {
    const r = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
    if (r.ok) {
      const data = await r.json();
      currentUser = data.user;
      return true;
    }
  } catch (e) {
    console.error('Auth check failed:', e);
  }
  return false;
}

// ── Login form ──────────────────────────────────────────────

let _mfaSessionToken = null; // holds partial token when MFA is required

function extractError(data) {
  const d = data?.detail || data?.error || data?.message;
  if (!d) return null;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.map(e => e.msg || JSON.stringify(e)).join(', ');
  if (typeof d === 'object') return d.msg || JSON.stringify(d);
  return String(d);
}

function showError(msg) {
  const el = document.getElementById('error-message');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearError() {
  const el = document.getElementById('error-message');
  if (el) { el.style.display = 'none'; el.textContent = ''; }
}

function setSubmitLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (btn) { btn.disabled = loading; btn.textContent = loading ? 'Please wait…' : btn.dataset.label; }
}

function showSection(id) {
  ['login-form-section', 'register-form-section', 'mfa-form-section'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.style.display = s === id ? '' : 'none';
  });
  clearError();
}

function initAuthForms() {
  // preserve button labels for loading state
  ['login-submit', 'register-submit', 'mfa-submit'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.dataset.label = btn.textContent;
  });

  document.getElementById('show-register')?.addEventListener('click', e => { e.preventDefault(); showSection('register-form-section'); });
  document.getElementById('show-login')?.addEventListener('click', e => { e.preventDefault(); showSection('login-form-section'); });
  document.getElementById('mfa-use-backup')?.addEventListener('click', e => { e.preventDefault(); promptBackupCode(); });

  document.getElementById('login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    clearError();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) { showError('Please enter your email and password.'); return; }

    setSubmitLoading('login-submit', true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) { showError(extractError(data) || 'Login failed.'); return; }

      if (data.mfa_required) {
        _mfaSessionToken = data.token;
        showSection('mfa-form-section');
        return;
      }

      localStorage.setItem('auth_token', data.token);
      currentUser = data.user || { code: email };
      await onLoginSuccess();
    } catch {
      showError('Could not reach the auth service. Is the sidecar running?');
    } finally {
      setSubmitLoading('login-submit', false);
    }
  });

  document.getElementById('register-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    clearError();
    const email            = document.getElementById('reg-email').value.trim();
    const password          = document.getElementById('reg-password').value;
    const confirm_password  = document.getElementById('reg-confirm-password').value;
    if (!email || !password || !confirm_password) { showError('Please fill in all fields.'); return; }
    if (password !== confirm_password) { showError('Passwords do not match.'); return; }

    setSubmitLoading('register-submit', true);
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirm_password }),
      });
      const data = await r.json();
      if (!r.ok) { showError(extractError(data) || 'Registration failed.'); return; }

      const ok = document.getElementById('register-success');
      if (ok) { ok.textContent = data.message || 'Account created! Check your email to verify, then sign in.'; ok.style.display = 'block'; }
      document.getElementById('register-form')?.reset();
    } catch {
      showError('Could not reach the auth service. Is the sidecar running?');
    } finally {
      setSubmitLoading('register-submit', false);
    }
  });

  document.getElementById('mfa-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    clearError();
    const totp_code = document.getElementById('mfa-code').value.trim();
    if (!totp_code) { showError('Enter your 6-digit code.'); return; }

    setSubmitLoading('mfa-submit', true);
    try {
      const r = await fetch('/api/auth/mfa/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: _mfaSessionToken, totp_code }),
      });
      const data = await r.json();
      if (!r.ok) { showError(extractError(data) || 'Invalid code.'); return; }

      localStorage.setItem('auth_token', data.token);
      _mfaSessionToken = null;
      await onLoginSuccess();
    } catch {
      showError('Could not reach the auth service.');
    } finally {
      setSubmitLoading('mfa-submit', false);
    }
  });
}

async function promptBackupCode() {
  clearError();
  const code = window.prompt('Enter your backup code:');
  if (!code) return;
  try {
    const r = await fetch('/api/auth/mfa/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_token: _mfaSessionToken, backup_code: code.trim() }),
    });
    const data = await r.json();
    if (!r.ok) { showError(data.detail || 'Invalid backup code.'); return; }
    localStorage.setItem('auth_token', data.token);
    _mfaSessionToken = null;
    await onLoginSuccess();
  } catch {
    showError('Could not reach the auth service.');
  }
}

async function onLoginSuccess() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'flex';
  displayUserInfo();
  await loadWorkouts();
  renderGoalsGrid();
  renderTodayView();
  renderInjuryGrid();
  updateGoals();
  updateNextWorkoutBanner();
  prefetchExerciseDb(); // warm the image DB in the background
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(updateNextWorkoutBanner, 1000);
  notifPermission = safeNotificationPermission();
  updateNotifBtn();
  if (notifPermission === 'granted' && localStorage.getItem('notificationsEnabled')) startNotifSchedule();
  document.getElementById('reset-button')?.addEventListener('click', resetWeek);
  document.getElementById('logout-button')?.addEventListener('click', logout);
  document.getElementById('notification-btn')?.addEventListener('click', toggleNotifications);
  document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn =>
    btn.addEventListener('click', () => showView(btn.dataset.view))
  );
}

async function logout() {
  try {
    const token = getStoredToken();
    if (token) {
      await fetch('/api/auth/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    }
  } catch (e) {
    console.error('Logout failed:', e);
  }
  localStorage.removeItem('auth_token');
  window.location.reload();
}

// ============================================================
// DATA
// ============================================================

async function loadWorkouts() {
  try {
    const r = await fetch(`/api/workouts?week_start=${getWeekStart()}`, { headers: authHeaders() });
    if (!r.ok) return;
    const data = await r.json();
    workoutData = {};
    (data.workouts || []).forEach(w => {
      workoutData[`${w.day}|${w.time}|${w.exercise}`] = w.completed === 1;
    });
    // Overlay partial-sets data from localStorage (stored per week)
    const setsKey = `sets|${getWeekStart()}`;
    try {
      const saved = JSON.parse(localStorage.getItem(setsKey) || '{}');
      Object.entries(saved).forEach(([k, v]) => {
        if (v > 0) workoutData[k] = v;
      });
    } catch (_) {}
  } catch (e) {
    console.error('Failed to load workouts:', e);
  }
}

async function saveWorkout(day, time, exercise, setsValue, totalSets) {
  // Persist partial sets to localStorage
  const setsKey = `sets|${getWeekStart()}`;
  try {
    const saved = JSON.parse(localStorage.getItem(setsKey) || '{}');
    const key = `${day}|${time}|${exercise}`;
    if (setsValue > 0) saved[key] = setsValue; else delete saved[key];
    localStorage.setItem(setsKey, JSON.stringify(saved));
  } catch (_) {}

  // Only sync to server when fully done or explicitly cleared
  const completed = (setsValue >= totalSets && totalSets > 0) ? 1 : (setsValue === 0 ? 0 : null);
  if (completed === null) return; // partial — don't update server
  try {
    await fetch('/api/workouts', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body:    JSON.stringify({ day, time, exercise, completed, week_start: getWeekStart() }),
    });
  } catch (e) {
    console.error('Failed to save workout:', e);
  }
}

// ============================================================
// GOAL CALCULATION
// ============================================================

function calculateGoals(day) {
  const totals = {};
  Object.keys(DAILY_GOALS).forEach(k => (totals[k] = 0));
  getSchedule().forEach(slot => {
    getEffectiveExercises(slot).forEach(ex => {
      const val = workoutData[`${day}|${slot.time}|${ex.name}`];
      if (ex.goal && val) {
        // val is either true (legacy/full) or a number of sets done
        const fraction = (typeof val === 'number' && ex.sets > 0)
          ? Math.min(val / ex.sets, 1)
          : 1;
        totals[ex.goal.key] = (totals[ex.goal.key] || 0) + ex.goal.amount * fraction;
      }
    });
  });
  return totals;
}

function calculateWeeklyProgress() {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  let completed = 0, total = 0;
  days.forEach(day =>
    getSchedule().forEach(slot =>
      getEffectiveExercises(slot).forEach(ex => {
        total++;
        const v = workoutData[`${day}|${slot.time}|${ex.name}`];
        if (typeof v === 'number' ? v >= ex.sets : !!v) completed++;
      })
    )
  );
  return { completed, total };
}

// ============================================================
// NOTIFICATIONS
// ============================================================

function updateNotifBtn() {
  const btn = document.getElementById('notification-btn');
  if (!btn) return;
  if (notifPermission === 'unsupported') {
    btn.textContent = '🔕'; btn.title = 'Notifications not supported in this browser'; return;
  }
  if (notifPermission === 'granted') {
    btn.textContent = '🔔'; btn.title = 'Workout notifications enabled (click to disable)';
    btn.classList.add('notif-active');
  } else if (notifPermission === 'denied') {
    btn.textContent = '🔕'; btn.title = 'Notifications blocked — check browser settings';
    btn.classList.remove('notif-active');
  } else {
    btn.textContent = '🔔'; btn.title = 'Click to enable workout notifications';
    btn.classList.remove('notif-active');
  }
}

async function toggleNotifications() {
  if (notifPermission === 'unsupported') {
    showToast('Desktop notifications are not supported in this browser.', 'error'); return;
  }
  if (notifPermission === 'denied') {
    showToast('Notifications are blocked. Please allow them in your browser settings.', 'warning'); return;
  }
  if (notifPermission === 'granted') {
    if (notifInterval) { clearInterval(notifInterval); notifInterval = null; }
    localStorage.removeItem('notificationsEnabled');
    notifPermission = 'default';   // reset so user can re-enable
    showToast('Workout notifications disabled.', 'info');
    updateNotifBtn();
    return;
  }
  notifPermission = await Notification.requestPermission();
  if (notifPermission === 'granted') {
    startNotifSchedule();
    localStorage.setItem('notificationsEnabled', '1');
    showToast('Workout notifications enabled! You\'ll be reminded at each workout time.', 'success');
  } else {
    showToast('Notification permission not granted.', 'error');
  }
  updateNotifBtn();
}

function startNotifSchedule() {
  if (notifInterval) clearInterval(notifInterval);
  notifInterval = setInterval(checkNotifs, 30_000);
  checkNotifs();
}

function checkNotifs() {
  if (notifPermission !== 'granted') return;
  const now   = new Date();
  const today = now.toISOString().split('T')[0];
  const ch    = now.getHours();
  const cm    = now.getMinutes();

  getSchedule().forEach(slot => {
    const sm = parseTimeToMinutes(slot.time);
    const sh = Math.floor(sm / 60);
    const min = sm % 60;
    // Notify within a 2-minute window
    if (ch === sh && Math.abs(cm - min) <= 1) {
      const key = `notified|${slot.time}|${today}`;
      if (!localStorage.getItem(key)) {
        fireNotification(slot);
        localStorage.setItem(key, '1');
      }
    }
  });
}

function fireNotification(slot) {
  const exs  = getEffectiveExercises(slot).slice(0, 3);
  const body = exs.map(e => `${e.emoji} ${e.name} — ${e.sets}×${e.reps}`).join('\n');
  const n = new Notification(`${slot.emoji} Time for ${slot.category}!`, {
    body,
    tag: `mw-${slot.time}`,
    requireInteraction: true,
  });
  n.onclick = () => { window.focus(); n.close(); };
}

// ============================================================
// TOASTS
// ============================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = message;
  container.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('visible')));
  setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 300); }, 3500);
}

// ============================================================
// INJURIES
// ============================================================

function loadInjuries() {
  try {
    const saved = localStorage.getItem('activeInjuries');
    activeInjuries = saved ? new Set(JSON.parse(saved)) : new Set();
  } catch (_) {
    activeInjuries = new Set();
  }
}

function saveInjuries() {
  localStorage.setItem('activeInjuries', JSON.stringify([...activeInjuries]));
}

function toggleInjury(key) {
  if (activeInjuries.has(key)) activeInjuries.delete(key);
  else                          activeInjuries.add(key);
  saveInjuries();
  renderInjuryGrid();
  renderTodayView();
  updateGoals();
}

// ============================================================
// RENDERING — GOALS RING
// ============================================================

function renderGoalsGrid() {
  const grid = document.getElementById('goals-grid');
  if (!grid) return;
  // circumference of circle r=15.9 ≈ 100, so stroke-dasharray X 100 equals X%
  grid.innerHTML = Object.entries(DAILY_GOALS).map(([key, cfg]) => `
    <div class="goal-card">
      <div class="goal-ring-wrap">
        <svg class="ring-svg" viewBox="0 0 36 36">
          <circle class="ring-track"    cx="18" cy="18" r="15.9" fill="none"/>
          <circle class="ring-progress" cx="18" cy="18" r="15.9" fill="none"
            id="goal-ring-${key}"
            style="stroke:${cfg.color};stroke-dasharray:0 100"
            transform="rotate(-90 18 18)"/>
        </svg>
        <div class="ring-center">
          <div class="ring-count" id="goal-count-${key}">0</div>
          <div class="ring-of">/ ${cfg.displayTarget || cfg.target}</div>
        </div>
      </div>
      <div class="goal-meta">
        <div class="goal-label">${cfg.emoji} ${cfg.label}</div>
        <div class="goal-target">Goal: ${cfg.displayTarget || cfg.target} ${cfg.unit !== 'sec' ? cfg.unit : ''}</div>
        <div class="goal-pct" id="goal-pct-${key}" style="color:${cfg.color}">0%</div>
      </div>
    </div>
  `).join('');
}

function updateGoals() {
  const today  = getCurrentDayName();
  const totals = calculateGoals(today);

  Object.entries(DAILY_GOALS).forEach(([key, cfg]) => {
    const cur = totals[key] || 0;
    const pct = Math.min(100, Math.round((cur / cfg.target) * 100));

    const cntEl  = document.getElementById(`goal-count-${key}`);
    const ringEl = document.getElementById(`goal-ring-${key}`);
    const pctEl  = document.getElementById(`goal-pct-${key}`);

    if (cntEl) {
      if (cfg.unit === 'sec') {
        const m = Math.floor(cur / 60), s = cur % 60;
        cntEl.textContent = m > 0 ? `${m}m${s}s` : `${s}s`;
      } else {
        cntEl.textContent = cur;
      }
    }
    if (ringEl) ringEl.style.strokeDasharray = `${pct} 100`;
    if (pctEl)  pctEl.textContent = `${pct}%`;
  });
}

// ============================================================
// RENDERING — TODAY
// ============================================================

function renderTodayView() {
  const today     = getCurrentDayName();
  const isWeekend = today === 'Saturday' || today === 'Sunday';
  const cards     = document.getElementById('workout-cards');
  const title     = document.getElementById('today-section-title');

  if (!cards) return;

  if (title) title.textContent = isWeekend ? 'Rest Day 🌿' : `${today}'s Plan`;

  if (isWeekend) {
    cards.innerHTML = `
      <div class="rest-day-card">
        <div class="rest-day-emoji">🌿</div>
        <h3>Rest &amp; Recover</h3>
        <p>It's the weekend — your body needs rest to grow stronger.</p>
        <p class="rest-tips">💡 Light walks, yoga or a gentle stretch are always welcome.</p>
      </div>`;
    return;
  }

  cards.innerHTML = getSchedule().map(slot => renderWorkoutCard(slot, today)).join('');
  attachCardListeners(today);
}

function renderWorkoutCard(slot, day) {
  const exercises = getEffectiveExercises(slot);
  const done      = exercises.filter(ex => {
    const v = workoutData[`${day}|${slot.time}|${ex.name}`];
    return typeof v === 'number' ? v >= ex.sets : !!v;
  }).length;
  const total     = exercises.length;
  const pct       = total ? Math.round((done / total) * 100) : 0;

  const slotMins = parseTimeToMinutes(slot.time);
  const now      = currentMinutes();
  const isCurrent  = Math.abs(slotMins - now) <= 60;
  const isNext     = slotMins > now && slotMins - now <= 90;
  const isPastSlot = slotMins + 90 < now;
  const allDone    = done === total;

  let cardClass = 'workout-card';
  if (allDone)  cardClass += ' card-done';
  else if (isCurrent) cardClass += ' card-current';
  else if (isNext)    cardClass += ' card-next';
  else if (isPastSlot && !allDone) cardClass += ' card-missed';

  let badge = '';
  if (allDone)   badge = '<span class="card-badge badge-done">✓ Done</span>';
  else if (isCurrent) badge = '<span class="card-badge badge-now">▶ Now</span>';
  else if (isNext)    badge = '<span class="card-badge badge-next">Up next</span>';
  else                badge = `<span class="card-badge">${done}/${total}</span>`;

  const injMod = exercises.some(e => e.isAlternative);

  return `
    <div class="${cardClass}" data-slot-time="${slot.time}">
      <div class="card-header">
        <div class="card-time">${slot.time}</div>
        <div class="card-category">
          <span class="card-emoji">${slot.emoji}</span>
          ${slot.category}
          ${injMod ? '<span class="injury-badge" title="Modified for your injuries">🩺</span>' : ''}
        </div>
        ${badge}
      </div>
      <div class="card-progress-bar">
        <div class="card-progress-fill" style="width:${pct}%;background:${slot.color}"></div>
      </div>
      <div class="card-exercises">
        ${exercises.map(ex => renderExerciseRow(ex, slot, day)).join('')}
      </div>
    </div>`;
}

function renderExerciseRow(ex, slot, day) {
  const key      = `${day}|${slot.time}|${ex.name}`;
  const val      = workoutData[key];   // undefined | true | number
  const setsDone = typeof val === 'number' ? val : (val ? ex.sets : 0);
  const allDone  = setsDone >= ex.sets;
  const repLabel = typeof ex.reps === 'number'
    ? `${ex.sets} × ${ex.reps} reps`
    : `${ex.sets} × ${ex.reps}`;
  const goalTag = ex.goal
    ? `<span class="exercise-goal-tag" style="color:${DAILY_GOALS[ex.goal.key].color}">${ex.goal.amount} ${DAILY_GOALS[ex.goal.key].unit === 'sec' ? 'sec' : DAILY_GOALS[ex.goal.key].unit}</span>`
    : '';
  const altTag = ex.isAlternative ? '<span class="alt-tag">Alternative</span>' : '';

  const howBtn = ex.how
    ? `<button class="how-btn" type="button" aria-label="How to do ${ex.name}" data-how="${ex.how.replace(/"/g, '&quot;')}">ℹ</button>`
    : '';
  const howPanel = ex.how
    ? `<div class="how-panel" hidden>${ex.how}</div>`
    : '';

  // Sets stepper — minus / count / plus
  const stepper = `
    <div class="sets-stepper${allDone ? ' stepper-done' : ''}" data-day="${day}" data-time="${slot.time}" data-exercise="${ex.name}" data-sets="${ex.sets}">
      <button class="stepper-btn stepper-minus" aria-label="Remove set" ${setsDone === 0 ? 'disabled' : ''}>−</button>
      <span class="stepper-val">${setsDone}<span class="stepper-total">/${ex.sets}</span></span>
      <button class="stepper-btn stepper-plus" aria-label="Add set" ${allDone ? 'disabled' : ''}>+</button>
    </div>`;

  return `
    <div class="exercise-row${allDone ? ' exercise-done' : ''}${ex.isAlternative ? ' exercise-alternative' : ''}">
      <span class="exercise-emoji">${ex.emoji}</span>
      <span class="exercise-details">
        <span class="exercise-name">${ex.name}</span>
        <span class="exercise-reps">${repLabel}</span>
      </span>
      ${goalTag}${altTag}
      ${howBtn}
      ${stepper}
    </div>${howPanel}`;
}

function attachCardListeners(day) {
  // Sets stepper buttons
  document.querySelectorAll('#workout-cards .sets-stepper').forEach(stepper => {
    const { day: d, time, exercise, sets: setsStr } = stepper.dataset;
    const totalSets = parseInt(setsStr, 10) || 1;

    const valEl    = stepper.querySelector('.stepper-val');
    const minusBtn = stepper.querySelector('.stepper-minus');
    const plusBtn  = stepper.querySelector('.stepper-plus');
    const row      = stepper.closest('.exercise-row');

    function currentSets() {
      const v = workoutData[`${d}|${time}|${exercise}`];
      return typeof v === 'number' ? v : (v ? totalSets : 0);
    }

    async function updateSets(newVal) {
      newVal = Math.max(0, Math.min(newVal, totalSets));
      const key = `${d}|${time}|${exercise}`;
      workoutData[key] = newVal > 0 ? newVal : false;

      // Update stepper UI
      const allDone = newVal >= totalSets;
      valEl.innerHTML = `${newVal}<span class="stepper-total">/${totalSets}</span>`;
      minusBtn.disabled = newVal === 0;
      plusBtn.disabled  = allDone;
      stepper.classList.toggle('stepper-done', allDone);
      row?.classList.toggle('exercise-done', allDone);

      // Update card progress
      const card = stepper.closest('.workout-card');
      const slot = getSchedule().find(s => s.time === time);
      if (card && slot) {
        const exercises  = getEffectiveExercises(slot);
        const doneCount  = exercises.filter(ex => workoutData[`${d}|${time}|${ex.name}`]).length;
        const total      = exercises.length;
        const pct        = total ? Math.round((doneCount / total) * 100) : 0;
        const fill       = card.querySelector('.card-progress-fill');
        if (fill) fill.style.width = `${pct}%`;
        const cardAllDone = doneCount === total;
        const badgeEl    = card.querySelector('.card-badge');
        if (badgeEl && cardAllDone) {
          badgeEl.textContent = '✓ Done';
          badgeEl.className   = 'card-badge badge-done';
          card.classList.add('card-done');
        } else if (badgeEl && !cardAllDone) {
          if (badgeEl.classList.contains('badge-done')) {
            badgeEl.textContent = `${doneCount}/${total}`;
            badgeEl.className   = 'card-badge';
            card.classList.remove('card-done');
          }
        }
      }

      await saveWorkout(d, time, exercise, newVal, totalSets);
      updateGoals();
    }

    plusBtn.addEventListener('click',  () => updateSets(currentSets() + 1));
    minusBtn.addEventListener('click', () => updateSets(currentSets() - 1));
  });

  // How-to toggle
  document.querySelectorAll('#workout-cards .how-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      const row     = btn.closest('.exercise-row');
      const sibling = row?.nextElementSibling;
      if (!sibling?.classList.contains('how-panel')) return;
      const isOpen = !sibling.hidden;
      sibling.hidden = isOpen;
      btn.classList.toggle('how-btn-active', !isOpen);

      // Inject image the first time the panel is opened
      if (!isOpen && !sibling.dataset.imgLoaded) {
        sibling.dataset.imgLoaded = '1';
        const exerciseName = row.querySelector('.exercise-name')?.textContent;
        if (exerciseName) {
          const imgSlot = document.createElement('div');
          imgSlot.className = 'how-img-slot';
          imgSlot.innerHTML = '<span class="how-img-loading">Loading image…</span>';
          sibling.prepend(imgSlot);
          const url = await getExerciseImageUrl(exerciseName);
          if (url) {
            const img = document.createElement('img');
            img.className = 'how-img';
            img.alt = exerciseName;
            img.src = url;
            img.loading = 'lazy';
            img.onerror = () => imgSlot.remove();
            imgSlot.replaceChildren(img);
          } else {
            imgSlot.remove();
          }
        }
      }
    });
  });
}

// ============================================================
// RENDERING — WEEK TABLE
// ============================================================

function renderWeekView() {
  const table = document.getElementById('workout-table');
  if (!table) return;

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

  const dayProg = {};
  days.forEach(day => {
    let c = 0, t = 0;
    getSchedule().forEach(slot =>
      getEffectiveExercises(slot).forEach(ex => {
        t++;
        const v = workoutData[`${day}|${slot.time}|${ex.name}`];
        if (typeof v === 'number' ? v >= ex.sets : !!v) c++;
      })
    );
    dayProg[day] = { c, t, pct: t ? Math.round(c / t * 100) : 0 };
  });

  let html = `<tr>
    <th>Exercise</th>
    ${days.map(d => `<th>
      <div class="week-day-header">
        ${d}<span class="day-pct${dayProg[d].pct === 100 ? ' complete' : ''}">${dayProg[d].pct}%</span>
      </div>
    </th>`).join('')}
  </tr>`;

  getSchedule().forEach(slot => {
    const exercises = getEffectiveExercises(slot);
    exercises.forEach((ex, idx) => {
      const isFirst = idx === 0;
      html += `<tr>`;
      if (isFirst) {
        html += `<td class="time-cell" rowspan="${exercises.length}">
          <div class="time-label">${slot.emoji} ${slot.time}</div>
          <div class="time-category">${slot.category}</div>
        </td>`;
      }
      html += days.map(day => {
        const key     = `${day}|${slot.time}|${ex.name}`;
        const v       = workoutData[key];
        const checked = typeof v === 'number' ? v >= ex.sets : !!v;
        return `<td>
          <label class="week-check${checked ? ' checked' : ''}">
            <input type="checkbox" ${checked ? 'checked' : ''}
              data-day="${day}" data-time="${slot.time}" data-exercise="${ex.name}" data-sets="${ex.sets}">
            ${ex.emoji} ${ex.name}
          </label>
        </td>`;
      }).join('');
      html += '</tr>';
    });
  });

  table.innerHTML = html;

  // Progress bar
  const overall = calculateWeeklyProgress();
  const opct    = overall.total ? Math.round((overall.completed / overall.total) * 100) : 0;
  const bar     = document.getElementById('progress');
  if (bar) bar.style.width = `${opct}%`;
  const txt = document.getElementById('progress-text');
  if (txt) txt.textContent = `${overall.completed} of ${overall.total} exercises completed this week (${opct}%)`;

  // Listeners
  table.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', async e => {
      const { day, time, exercise, sets: setsStr } = e.target.dataset;
      const totalSets = parseInt(setsStr, 10) || 1;
      const newVal    = e.target.checked ? totalSets : 0;
      workoutData[`${day}|${time}|${exercise}`] = e.target.checked ? totalSets : false;
      await saveWorkout(day, time, exercise, newVal, totalSets);
      renderWeekView();
      updateGoals();
    });
  });
}

// ============================================================
// RENDERING — INJURIES
// ============================================================

function renderInjuryGrid() {
  const grid = document.getElementById('injury-grid');
  if (!grid) return;

  grid.innerHTML = INJURIES_CONFIG.map(inj => {
    const active = activeInjuries.has(inj.key);
    return `
      <div class="injury-card${active ? ' injury-active' : ''}" onclick="toggleInjury('${inj.key}')">
        <div class="injury-emoji">${inj.emoji}</div>
        <div class="injury-label">${inj.label}</div>
        <div class="injury-desc">${inj.desc}</div>
        ${active ? '<div class="injury-active-badge">⚠️ Active</div>' : ''}
      </div>`;
  }).join('');

  const badge = document.getElementById('injury-badge');
  if (badge) {
    badge.textContent = activeInjuries.size || '';
    badge.style.display = activeInjuries.size ? 'inline-block' : 'none';
  }
}

// ============================================================
// NEXT-WORKOUT BANNER
// ============================================================

function updateNextWorkoutBanner() {
  const titleEl    = document.getElementById('next-workout-title');
  const timeEl     = document.getElementById('next-workout-time');
  const countdownEl = document.getElementById('next-workout-countdown');
  if (!titleEl) return;

  const nowSec  = currentSeconds();
  let upcoming  = null;

  for (const slot of getSchedule()) {
    const slotSec = parseTimeToMinutes(slot.time) * 60;
    if (slotSec > nowSec) { upcoming = { slot, diffSec: slotSec - nowSec }; break; }
  }

  if (!upcoming) {
    titleEl.textContent    = 'All done for today! 🎉';
    if (timeEl) timeEl.textContent = 'Great work — see you tomorrow.';
    if (countdownEl) countdownEl.textContent = '';
    return;
  }

  const { slot, diffSec } = upcoming;
  titleEl.textContent = `${slot.emoji} ${slot.category}`;
  if (timeEl) timeEl.textContent = `at ${slot.time}`;

  if (countdownEl) {
    if (diffSec <= 0) {
      countdownEl.textContent = '▶ Now!';
    } else {
      const h = Math.floor(diffSec / 3600);
      const m = Math.floor((diffSec % 3600) / 60);
      const s = diffSec % 60;
      countdownEl.textContent = h > 0 ? `in ${h}h ${m}m` : m > 0 ? `in ${m}m ${s}s` : `in ${s}s`;
    }
  }
}

// ============================================================
// NAVIGATION
// ============================================================

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('view-active'));
  document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(b => b.classList.remove('active'));

  const view = document.getElementById(`view-${name}`);
  if (view) view.classList.add('view-active');

  document.querySelectorAll(`[data-view="${name}"]`).forEach(b => b.classList.add('active'));

  if (name === 'week') renderWeekView();
  if (name === 'programs') renderProgramsView();
}

// ============================================================
// PROGRAMS VIEW
// ============================================================

function renderProgramsView() {
  const grid = document.getElementById('program-grid');
  if (!grid) return;
  const active = getActiveProgram();

  grid.innerHTML = Object.values(PROGRAMS).map(p => `
    <div class="program-card${p.id === active.id ? ' program-card-active' : ''}" data-program-id="${p.id}">
      <div class="program-card-icon">${p.icon}</div>
      <div class="program-card-body">
        <div class="program-card-name">${p.name}</div>
        <div class="program-card-desc">${p.desc}</div>
      </div>
      ${p.id === active.id
        ? '<span class="program-active-badge">✓ Active</span>'
        : `<button class="program-select-btn" data-program-id="${p.id}">Switch</button>`}
    </div>
  `).join('');

  grid.querySelectorAll('.program-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.programId;
      if (!confirm(`Switch to the "${PROGRAMS[id].name}" program? Your workout history stays saved but today\'s view will show the new program.`)) return;
      setActiveProgram(id);
      renderProgramsView();
      renderTodayView();
      updateGoals();
      showToast(`Switched to ${PROGRAMS[id].name} program.`, 'success');
    });
  });
}

// ============================================================
// RESET
// ============================================================

async function resetWeek() {
  if (!confirm('Reset all workouts for this week?')) return;
  try {
    await fetch(`/api/workouts?week_start=${getWeekStart()}`, { method: 'DELETE', headers: authHeaders() });
    workoutData = {};
    renderTodayView();
    updateGoals();
    renderWeekView();
    showToast('Workout data has been reset.', 'success');
  } catch (e) {
    console.error('Reset failed:', e);
    showToast('Failed to reset. Please try again.', 'error');
  }
}

// ============================================================
// USER INFO
// ============================================================

function displayUserInfo() {
  if (!currentUser) return;
  const nameEl = document.getElementById('user-name');
  if (nameEl) nameEl.textContent = currentUser.email || currentUser.code || 'User';
}

// ============================================================
// INIT
// ============================================================

async function init() {
  loadInjuries();

  const authed = await checkAuth();

  if (authed) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-screen').style.display  = 'flex';

    displayUserInfo();
    await loadWorkouts();

    renderGoalsGrid();
    renderTodayView();
    renderInjuryGrid();
    updateGoals();
    updateNextWorkoutBanner();

    // Countdown timer (1-second ticks)
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(updateNextWorkoutBanner, 1000);

    // Notification state
    notifPermission = safeNotificationPermission();
    updateNotifBtn();
    if (notifPermission === 'granted' && localStorage.getItem('notificationsEnabled')) {
      startNotifSchedule();
    }

    // Wire up controls
    document.getElementById('reset-button')?.addEventListener('click', resetWeek);
    document.getElementById('logout-button')?.addEventListener('click', logout);
    document.getElementById('notification-btn')?.addEventListener('click', toggleNotifications);
    document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn =>
      btn.addEventListener('click', () => showView(btn.dataset.view))
    );

  } else {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display  = 'none';
    initAuthForms();
  }
}

init();
