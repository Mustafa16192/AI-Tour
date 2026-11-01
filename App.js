import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// PART 2 — Uncomment this import when you enable the AI request below.
// import { generateFocusPlan } from './ai/planService';

const SAMPLE_PLAN = {
  title: 'A steady start',
  summary: 'A sample plan preview. Add your goal and time, then enable the AI parts of the tour.',
  steps: [
    { title: 'Write down what you already know', minutes: 5 },
    { title: 'Review one key idea and make a quick example', minutes: 15 },
    { title: 'Take a short break, then recall the idea from memory', minutes: 5 },
  ],
};

const AVAILABLE_MINUTES = [25, 45, 60];

export default function App() {
  const [goal, setGoal] = React.useState('Prepare for my biology quiz');
  const [availableMinutes, setAvailableMinutes] = React.useState(25);
  const plan = SAMPLE_PLAN;
  // PART 3 — Replace the static preview above with: const [plan, setPlan] = React.useState(SAMPLE_PLAN);
  const [error, setError] = React.useState('');
  // PART 2 — Add this state when you enable the raw model reply preview below.
  // const [aiReply, setAIReply] = React.useState('');
  // PART 5 — Add request state when you enable the loading/error block below:
  // const [isGenerating, setIsGenerating] = React.useState(false);
  // PART 4 — Add completion state when you enable the checkboxes below:
  // const [completedSteps, setCompletedSteps] = React.useState({});
  // const completedCount = Object.values(completedSteps).filter(Boolean).length;

  // ======================================================
  // PART 2 — SEND A CONTEXTUAL REQUEST
  //
  // WHY: A study plan is useful when it uses this learner's goal and time,
  //      not when it is a generic chat reply.
  // PRODUCT QUESTION: Which details should shape a plan, and which should stay
  //                   out of the request?
  // DO: Uncomment the import at the top of App.js, add the marked aiReply
  //     state, and replace the starter setError line with the commented
  //     generateFocusPlan/setAIReply request. Enable PART 2 in ai/client.js
  //     and ai/planService.js, remove the button's `disabled` prop, change its
  //     label to “Generate a plan”, and enable the raw-reply preview below.
  // VERIFY: A configured provider returns a plan based on this goal and time.
  // NEXT: Search for "PART 3 — VALIDATE STRUCTURED OUTPUT" in ai/planService.js.
  // ======================================================
  async function createPlan() {
    setError('Enable PART 2 in App.js and ai/planService.js to generate a plan.');
    /* PART 2 — Replace the starter line above with this request:
    const text = await generateFocusPlan({ goal, availableMinutes });
    setAIReply(text);
    */

    /* PART 5 — Replace the whole starter body with this request lifecycle:
    setIsGenerating(true);
    setError('');
    try {
      const nextPlan = await generateFocusPlan({ goal, availableMinutes });
      setPlan(nextPlan);
      setCompletedSteps({});
    } catch (requestError) {
      setError(requestError.message || 'The plan could not be generated. Try again.');
    } finally {
      setIsGenerating(false);
    }
    */
  }

  // ======================================================
  // PART 3 — RENDER A VALIDATED PLAN
  //
  // WHY: A chat paragraph is hard to act on; validated fields make the AI
  //      response useful to the app's own interface.
  // PRODUCT QUESTION: What should the app do if the model returns unexpected
  //                   JSON or a plan that exceeds the available time?
  // DO: In ai/planService.js, remove the parser block's `/*` and `*/`, delete
  //     the TODO stub, and return parseFocusPlan() from generateFocusPlan().
  //     Replace the two Part 2 lines with `const nextPlan = await
  //     generateFocusPlan({ goal, availableMinutes }); setPlan(nextPlan);`.
  //     Replace the static `plan` line above with useState.
  // VERIFY: A generated response appears as a title, summary, and timed steps.
  // NEXT: Search for "PART 4 — MAKE THE RESULT AN APP FEATURE" below.
  // ======================================================

  // ======================================================
  // PART 4 — MAKE THE RESULT AN APP FEATURE
  //
  // WHY: A plan becomes useful when learners can act on it and see progress.
  // PRODUCT QUESTION: Should the app mark a task done automatically, or should
  //                   the learner stay in control?
  // DO: Uncomment the completion-state lines near the top of App(), the
  //     toggleStep() function below, and the checkbox and progress message.
  // VERIFY: Tapping a step toggles it and updates the progress count.
  // NEXT: Search for "PART 5 — HANDLE REQUEST STATES" below.
  // ======================================================
  // PART 4 — Uncomment this function after adding the completion state above.
  /*
  function toggleStep(index) {
    setCompletedSteps(current => ({ ...current, [index]: !current[index] }));
  }
  */

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>POCKET PLAN · A SMALL AI TOUR</Text>
          <Text style={styles.heading}>Make your next study session count.</Text>
          <Text style={styles.intro}>
            Give the planner a goal and a little time. It will turn them into a
            focused plan you can work through right here.
          </Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>What are you working on?</Text>
            <TextInput
              accessibilityLabel="Study goal"
              multiline
              onChangeText={setGoal}
              placeholder="e.g. Review cell biology for a quiz"
              style={styles.goalInput}
              value={goal}
            />

            <Text style={styles.label}>How much time do you have?</Text>
            <View style={styles.durationRow}>
              {AVAILABLE_MINUTES.map(minutes => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: minutes === availableMinutes }}
                  key={minutes}
                  onPress={() => setAvailableMinutes(minutes)}
                  style={[styles.durationButton, minutes === availableMinutes && styles.durationButtonSelected]}
                >
                  <Text style={[styles.durationText, minutes === availableMinutes && styles.durationTextSelected]}>
                    {minutes} min
                  </Text>
                </Pressable>
              ))}
            </View>

            {/*
              PART 5 — HANDLE REQUEST STATES

              WHY: Mobile networks fail, and people need feedback while a
                   request is taking its time.
              PRODUCT QUESTION: What should remain on screen after a failed
                              request so the learner can recover?
              DO: Replace the starter body of createPlan() with its commented
                  PART 5 try/catch/finally block above. Add the marked loading
                  state, set the button's disabled prop to isGenerating, and
                  show “Making your plan…” while the request is active.
              VERIFY: A mocked slow request shows loading; a rejected request
                      shows an error without discarding the current plan.
              NEXT: Review the completed tour and its security note in README.md.
            */}
            <Pressable
              accessibilityRole="button"
              disabled
              onPress={createPlan}
              style={[styles.primaryButton, styles.disabledButton]}
            >
              <Text style={styles.primaryButtonText}>Generate a plan · enable Part 2</Text>
            </Pressable>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          </View>

          {/* PART 2 — Uncomment this preview after adding the aiReply state. */}
          {/* {aiReply ? <Text accessibilityRole="text" style={styles.rawReply}>{aiReply}</Text> : null} */}

          <View style={styles.planHeader}>
            <View style={styles.planHeadingGroup}>
              <Text style={styles.sectionEyebrow}>YOUR SESSION</Text>
              <Text style={styles.planTitle}>{plan.title}</Text>
            </View>
            <Text style={styles.timePill}>{availableMinutes} min</Text>
          </View>
          <Text style={styles.summary}>{plan.summary}</Text>

          <Text style={styles.previewNote}>Example plan preview</Text>

          <View style={styles.steps}>
            {plan.steps.map((step, index) => (
              <View key={`${step.title}-${index}`} style={styles.stepCard}>
                <View style={styles.stepTopRow}>
                  <Text style={styles.stepNumber}>STEP {String(index + 1).padStart(2, '0')}</Text>
                  <Text style={styles.stepTime}>{step.minutes} min</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                {/* PART 4 — Uncomment this Pressable to enable checklist actions. */}
                {/*
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: Boolean(completedSteps[index]) }}
                  onPress={() => toggleStep(index)}
                  style={styles.checkButton}
                >
                  <Text style={styles.checkText}>{completedSteps[index] ? 'Done' : 'Mark complete'}</Text>
                </Pressable>
                */}
              </View>
            ))}
          </View>

          {/* PART 4 — Uncomment this line after adding completion state above. */}
          {/* <Text style={styles.progress}>{completedCount} of {plan.steps.length} steps complete</Text> */}

          <Text style={styles.footer}>
            The AI suggests a plan. You decide what to do with it.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#f5f5f0', flex: 1 },
  content: { gap: 16, padding: 20, paddingBottom: 32, paddingTop: 18 },
  eyebrow: { color: '#5b6955', fontSize: 11, fontWeight: '800', letterSpacing: 1.3 },
  heading: { color: '#1e2b20', fontSize: 31, fontWeight: '800', letterSpacing: -0.8, lineHeight: 37 },
  intro: { color: '#626c60', fontSize: 15, lineHeight: 22 },
  formCard: { backgroundColor: '#fff', borderColor: '#e4e7dd', borderRadius: 18, borderWidth: 1, gap: 12, padding: 16 },
  label: { color: '#364337', fontSize: 13, fontWeight: '700' },
  goalInput: { backgroundColor: '#fbfcf9', borderColor: '#dfe4d9', borderRadius: 11, borderWidth: 1, color: '#263229', fontSize: 15, minHeight: 72, padding: 12, textAlignVertical: 'top' },
  durationRow: { flexDirection: 'row', gap: 8 },
  durationButton: { alignItems: 'center', borderColor: '#dfe4d9', borderRadius: 10, borderWidth: 1, flex: 1, paddingVertical: 10 },
  durationButtonSelected: { backgroundColor: '#e9efe2', borderColor: '#809573' },
  durationText: { color: '#606b5c', fontSize: 13, fontWeight: '600' },
  durationTextSelected: { color: '#34472e', fontWeight: '800' },
  primaryButton: { alignItems: 'center', backgroundColor: '#53694a', borderRadius: 11, marginTop: 2, padding: 13 },
  disabledButton: { backgroundColor: '#9aa593' },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  error: { color: '#a33333', fontSize: 13, lineHeight: 18 },
  planHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  planHeadingGroup: { gap: 4 },
  sectionEyebrow: { color: '#78846f', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  planTitle: { color: '#1e2b20', fontSize: 22, fontWeight: '800' },
  timePill: { backgroundColor: '#e9efe2', borderRadius: 20, color: '#43563b', fontSize: 12, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 7 },
  summary: { color: '#626c60', fontSize: 14, lineHeight: 20, marginTop: -9 },
  progress: { color: '#52634c', fontSize: 12, fontWeight: '700' },
  previewNote: { color: '#78846f', fontSize: 12, fontWeight: '700' },
  steps: { gap: 10 },
  stepCard: { backgroundColor: '#fff', borderColor: '#e4e7dd', borderRadius: 14, borderWidth: 1, gap: 10, padding: 15 },
  stepTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  stepNumber: { color: '#78846f', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  stepTime: { color: '#5c6d52', fontSize: 12, fontWeight: '700' },
  stepTitle: { color: '#28352a', fontSize: 15, fontWeight: '700', lineHeight: 21 },
  checkButton: { alignSelf: 'flex-start', borderColor: '#809573', borderRadius: 8, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7 },
  checkText: { color: '#43563b', fontSize: 12, fontWeight: '700' },
  footer: { color: '#788078', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
