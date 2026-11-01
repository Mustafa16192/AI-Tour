import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { generateFocusPlan } from './ai/planService';

const SAMPLE_PLAN = {
  title: 'A steady start',
  summary: 'A sample plan preview. Add your goal and time to make a plan that fits your session.',
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
  const [plan, setPlan] = React.useState(SAMPLE_PLAN);
  const [completedSteps, setCompletedSteps] = React.useState({});
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState('');

  const completedCount = Object.values(completedSteps).filter(Boolean).length;

  async function createPlan() {
    if (!goal.trim()) {
      setError('Add a study goal before making a plan.');
      return;
    }

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
  }

  function toggleStep(index) {
    setCompletedSteps(current => ({ ...current, [index]: !current[index] }));
  }

  const isSamplePlan = plan === SAMPLE_PLAN;

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
              maxLength={300}
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

            <Pressable
              accessibilityRole="button"
              disabled={!goal.trim() || isGenerating}
              onPress={createPlan}
              style={[styles.primaryButton, (isGenerating || !goal.trim()) && styles.disabledButton]}
            >
              <View style={styles.buttonContents}>
                {isGenerating ? <ActivityIndicator color="#fff" size="small" /> : null}
                <Text style={styles.primaryButtonText}>
                  {isGenerating ? 'Making your plan…' : 'Generate focus plan'}
                </Text>
              </View>
            </Pressable>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          </View>

          <View style={styles.planHeader}>
            <View style={styles.planHeadingGroup}>
              <Text style={styles.sectionEyebrow}>{isSamplePlan ? 'EXAMPLE SESSION' : 'YOUR SESSION'}</Text>
              <Text style={styles.planTitle}>{plan.title}</Text>
            </View>
            <Text style={styles.timePill}>{availableMinutes} min</Text>
          </View>
          <Text style={styles.summary}>{plan.summary}</Text>

          {isSamplePlan ? <Text style={styles.previewNote}>Example plan preview</Text> : null}
          <Text style={styles.progress}>{completedCount} of {plan.steps.length} steps complete</Text>

          <View style={styles.steps}>
            {plan.steps.map((step, index) => {
              const isComplete = Boolean(completedSteps[index]);
              return (
                <View key={`${step.title}-${index}`} style={[styles.stepCard, isComplete && styles.stepCardComplete]}>
                  <View style={styles.stepTopRow}>
                    <Text style={styles.stepNumber}>STEP {String(index + 1).padStart(2, '0')}</Text>
                    <Text style={styles.stepTime}>{step.minutes} min</Text>
                  </View>
                  <Text style={[styles.stepTitle, isComplete && styles.stepTitleComplete]}>{step.title}</Text>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isComplete }}
                    onPress={() => toggleStep(index)}
                    style={styles.checkButton}
                  >
                    <Text style={styles.checkText}>{isComplete ? 'Done' : 'Mark complete'}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

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
  buttonContents: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  error: { color: '#a33333', fontSize: 13, lineHeight: 18 },
  planHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  planHeadingGroup: { gap: 4 },
  sectionEyebrow: { color: '#78846f', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  planTitle: { color: '#1e2b20', fontSize: 22, fontWeight: '800' },
  timePill: { backgroundColor: '#e9efe2', borderRadius: 20, color: '#43563b', fontSize: 12, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 7 },
  summary: { color: '#626c60', fontSize: 14, lineHeight: 20, marginTop: -9 },
  previewNote: { color: '#78846f', fontSize: 12, fontWeight: '700' },
  progress: { color: '#52634c', fontSize: 12, fontWeight: '700' },
  steps: { gap: 10 },
  stepCard: { backgroundColor: '#fff', borderColor: '#e4e7dd', borderRadius: 14, borderWidth: 1, gap: 10, padding: 15 },
  stepCardComplete: { backgroundColor: '#f0f4eb', borderColor: '#cfdac5' },
  stepTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  stepNumber: { color: '#78846f', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  stepTime: { color: '#5c6d52', fontSize: 12, fontWeight: '700' },
  stepTitle: { color: '#28352a', fontSize: 15, fontWeight: '700', lineHeight: 21 },
  stepTitleComplete: { color: '#66715f', textDecorationLine: 'line-through' },
  checkButton: { alignSelf: 'flex-start', borderColor: '#809573', borderRadius: 8, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7 },
  checkText: { color: '#43563b', fontSize: 12, fontWeight: '700' },
  footer: { color: '#788078', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
