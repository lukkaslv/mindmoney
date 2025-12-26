
import { GameHistoryItem, PatternFlags } from '../types';
import { TOTAL_NODES } from '../constants';

const MONOTONIC_THRESHOLD = 0.8;
const HIGH_SKIP_RATE_THRESHOLD = 0.4;
const ROBOTIC_TIMING_STD_DEV_THRESHOLD = 300; // Lowered for higher precision
const SOMATIC_VARIETY_THRESHOLD = 3;
const EARLY_TERMINATION_THRESHOLD = 0.7;
const CHAOTIC_RHYTHM_THRESHOLD = 4.0; // Ratio between max and min latency segments

const calculate_std_dev = (arr: number[]) => {
    if (arr.length < 5) return 1000;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(variance);
};

export const PatternDetector = {
  analyze(history: GameHistoryItem[]): PatternFlags & { isInconsistentRhythm: boolean } {
    const totalAnswers = history.length;
    const isEarlyTermination = totalAnswers < TOTAL_NODES * EARLY_TERMINATION_THRESHOLD;

    if (totalAnswers < 5) { 
      return { isMonotonic: false, isHighSkipRate: false, isFlatline: false, isRoboticTiming: false, isSomaticMonotony: false, isEarlyTermination, dominantPosition: null, isInconsistentRhythm: false };
    }

    // 1. Monotonic (Same position)
    const positionCounts = [0, 0, 0];
    let validPositionAnswers = 0;
    history.forEach(item => {
      if (item.choicePosition >= 0 && item.choicePosition <= 2) {
        positionCounts[item.choicePosition]++;
        validPositionAnswers++;
      }
    });
    
    let isMonotonic = false;
    let dominantPosition: number | null = null;
    if (validPositionAnswers > 8) {
        for (let i = 0; i < 3; i++) {
            if ((positionCounts[i] / validPositionAnswers) >= MONOTONIC_THRESHOLD) {
                isMonotonic = true;
                dominantPosition = i;
                break;
            }
        }
    }

    // 4. Robotic Timing ("Metronome")
    const latencies = history.map(h => h.latency).filter(l => l > 300 && l < 30000);
    const latencyStdDev = calculate_std_dev(latencies);
    const isRoboticTiming = latencyStdDev < ROBOTIC_TIMING_STD_DEV_THRESHOLD;

    // 7. Inconsistent Rhythm (Spoofing attempt)
    // Checking if user suddenly changes behavior from very fast to very slow
    const firstHalf = latencies.slice(0, Math.floor(latencies.length / 2));
    const secondHalf = latencies.slice(Math.floor(latencies.length / 2));
    const avg1 = firstHalf.reduce((a,b) => a+b, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((a,b) => a+b, 0) / secondHalf.length;
    const isInconsistentRhythm = (avg1 / avg2 > CHAOTIC_RHYTHM_THRESHOLD) || (avg2 / avg1 > CHAOTIC_RHYTHM_THRESHOLD);

    // 5. Somatic Monotony
    const uniqueSensations = new Set(history.map(h => h.sensation));
    const isSomaticMonotony = uniqueSensations.size < SOMATIC_VARIETY_THRESHOLD;
    
    const isHighSkipRate = (history.filter(h => h.beliefKey === 'default').length / Math.max(totalAnswers, TOTAL_NODES)) >= HIGH_SKIP_RATE_THRESHOLD;

    return {
      isMonotonic,
      isHighSkipRate,
      isFlatline: false,
      isRoboticTiming,
      isSomaticMonotony,
      isEarlyTermination,
      dominantPosition,
      isInconsistentRhythm
    };
  }
};
