import { useState, useEffect } from 'react';
import type { UserProgress, ClassifiedEmail, Email } from '../types/email';

const POINTS_PER_CORRECT = 1;

export const useUserProgress = (emails: Email[]) => {
    const [userProgress, setUserProgress] = useState<UserProgress>({
        points: 0,
        classifiedEmails: [],
        totalClassifiableEmails: 17, // Завжди 17 листів для класифікації (id 2-18)
        completionPercentage: 0,
        averageResponseTime: 0,
    });

    const [emailViewStartTime, setEmailViewStartTime] = useState<number | null>(null);

    // Загальна кількість листів які можна класифікувати (виключаємо перший та останній)
    const totalClassifiableCount = 16; // id 2-18

    useEffect(() => {
        // Ініціалізуємо прогрес без localStorage
        const initialProgress: UserProgress = {
            points: 0,
            classifiedEmails: [],
            totalClassifiableEmails: totalClassifiableCount,
            completionPercentage: 0,
            averageResponseTime: 0,
        };
        setUserProgress(initialProgress);
    }, []);

    const calculateCompletionPercentage = (classified: ClassifiedEmail[], total: number): number => {
        if (total === 0) return 0;
        return Math.round((classified.length / total) * 100);
    };

    const classifyEmail = (emailId: string, isPhishingGuess: boolean) => {
        // Знаходимо email для перевірки правильності
        const email = emails.find(e => e.id === emailId);
        if (!email) return;

        // Перевіряємо чи вже класифікований цей email
        const existingClassification = userProgress.classifiedEmails.find(
            c => c.emailId === emailId
        );

        if (existingClassification) {
            // Оновлюємо існуючу класифікацію
            const updatedClassifications = userProgress.classifiedEmails.map(c =>
                c.emailId === emailId
                    ? {
                        ...c,
                        isPhishingGuess,
                        isCorrect: isPhishingGuess === email.isPhishing,
                        timestamp: Date.now()
                    }
                    : c
            );

            const newProgress = {
                ...userProgress,
                classifiedEmails: updatedClassifications,
                points: calculatePoints(updatedClassifications),
                completionPercentage: calculateCompletionPercentage(updatedClassifications, totalClassifiableCount),
                averageResponseTime: calculateAverageResponseTime(updatedClassifications),
            };

            setUserProgress(newProgress);
        } else {
            // Додаємо нову класифікацію
            const isCorrect = isPhishingGuess === email.isPhishing;
            const responseTime = emailViewStartTime ? Date.now() - emailViewStartTime : 0;
            const newClassification: ClassifiedEmail = {
                emailId,
                isPhishingGuess,
                isCorrect,
                timestamp: Date.now(),
                responseTime,
                emailViewedAt: emailViewStartTime || Date.now(),
            };

            const updatedClassifications = [...userProgress.classifiedEmails, newClassification];
            const newProgress = {
                ...userProgress,
                classifiedEmails: updatedClassifications,
                points: calculatePoints(updatedClassifications),
                completionPercentage: calculateCompletionPercentage(updatedClassifications, totalClassifiableCount),
                averageResponseTime: calculateAverageResponseTime(updatedClassifications),
            };

            setUserProgress(newProgress);
        }
    };

    const calculatePoints = (classifications: ClassifiedEmail[]): number => {
        return classifications.reduce((total, classification) => {
            return total + (classification.isCorrect ? POINTS_PER_CORRECT : 0);
        }, 0);
    };

    const calculateAverageResponseTime = (classifications: ClassifiedEmail[]): number => {
        if (classifications.length === 0) return 0;
        const totalTime = classifications.reduce((sum, c) => sum + c.responseTime, 0);
        return Math.round(totalTime / classifications.length);
    };

    const getEmailClassification = (emailId: string): ClassifiedEmail | undefined => {
        return userProgress.classifiedEmails.find(c => c.emailId === emailId);
    };

    const isEmailClassifiable = (emailId: string): boolean => {
        return emailId !== "1" && emailId !== "18";
    };

    const startEmailView = (emailId: string) => {
        if (isEmailClassifiable(emailId)) {
            setEmailViewStartTime(Date.now());
        }
    };

    const resetProgress = () => {
        const initialProgress: UserProgress = {
            points: 0,
            classifiedEmails: [],
            totalClassifiableEmails: totalClassifiableCount,
            completionPercentage: 0,
            averageResponseTime: 0,
        };
        setUserProgress(initialProgress);
    };

    return {
        userProgress,
        classifyEmail,
        getEmailClassification,
        isEmailClassifiable,
        startEmailView,
        resetProgress,
    };
};
