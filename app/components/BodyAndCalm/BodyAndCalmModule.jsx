'use client';
import { useState, useEffect } from 'react';
import MedicalDisclaimerModal from './MedicalDisclaimerModal';
import CategoriesView from './CategoriesView';
import ActivitiesListView from './ActivitiesListView';
import ExercisePlayer from './ExercisePlayer';
import BreathingAndCoreExperience from './BreathingAndCoreExperience';

export default function BodyAndCalmModule({ onBack, userProfile }) {
  const [screen, setScreen] = useState('categories');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    // Start this section at the top without scroll animations or focus changes.
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Verificar si ya vio el disclaimer
    const hasSeenDisclaimer = localStorage.getItem('hasSeenMedicalDisclaimer');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleDisclaimerAccept = () => {
    localStorage.setItem('hasSeenMedicalDisclaimer', 'true');
    setShowDisclaimer(false);
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setScreen(categoryId === 'breathing' ? 'breathing' : 'activities');
  };

  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity);
    setScreen('exercise');
  };

  const handleExerciseComplete = () => {
    setScreen('categories');
    setSelectedCategory(null);
    setSelectedActivity(null);
    onBack();
  };

  const handleBackFromActivities = () => {
    setSelectedCategory(null);
    setScreen('categories');
  };

  const handleBackFromExercise = () => {
    setSelectedActivity(null);
    setScreen('activities');
  };

  if (showDisclaimer) {
    return <MedicalDisclaimerModal onAccept={handleDisclaimerAccept} />;
  }

  if (screen === 'exercise' && selectedActivity) {
    return (
      <ExercisePlayer
        activity={selectedActivity}
        onComplete={handleExerciseComplete}
        onBack={handleBackFromExercise}
      />
    );
  }

  if (screen === 'activities' && selectedCategory) {
    return (
      <ActivitiesListView
        categoryId={selectedCategory}
        onSelectActivity={handleSelectActivity}
        onBack={handleBackFromActivities}
      />
    );
  }

  if (screen === 'breathing') {
    return <BreathingAndCoreExperience onBack={handleBackFromActivities} />;
  }

  return (
    <CategoriesView
      onSelectCategory={handleSelectCategory}
      onBack={onBack}
    />
  );
}
