
import { GoogleGenAI, Type } from "@google/genai";
import type { Group, FundHealth, FundHealthStatus, AIAssessment } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

export const predictFundHealth = async (group: Group): Promise<FundHealth> => {
    const totalPool = group.transactions.reduce((acc, t) => t.type === 'contribution' ? acc + t.amount : acc - t.amount, 0);
    const recentContributions = group.transactions.filter(t => t.type === 'contribution' && new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
    const recentClaims = group.claims.filter(c => new Date(c.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

    const prompt = `
        Analyze the financial health of a community microinsurance pool.
        Current total funds: ${totalPool}.
        Number of members: ${group.members.length}.
        Recent contributions (last 30 days): ${recentContributions}.
        Recent claims (last 30 days): ${recentClaims}.
        
        Based on this data, provide a health status and a brief analysis (one sentence).
        The status must be one of: 'Healthy', 'Stable', 'At Risk'.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        status: {
                            type: Type.STRING,
                            enum: ['Healthy', 'Stable', 'At Risk'],
                            description: "The fund's health status."
                        },
                        analysis: {
                            type: Type.STRING,
                            description: "A brief, one-sentence analysis."
                        }
                    },
                    required: ["status", "analysis"]
                }
            }
        });
        
        const jsonResponse = JSON.parse(response.text);

        return {
            status: jsonResponse.status as FundHealthStatus,
            analysis: jsonResponse.analysis,
        };

    } catch (error) {
        console.error("Error calling Gemini API for fund health:", error);
        throw new Error("Failed to get fund health prediction from AI.");
    }
};

export const assessClaimValidity = async (
    claim: { description: string; amount: number },
    group: Group
): Promise<AIAssessment> => {
    const totalPool = group.transactions.reduce((acc, t) => t.type === 'contribution' ? acc + t.amount : acc - t.amount, 0);
    const averageClaimAmount = group.claims.length > 0
        ? group.claims.reduce((acc, c) => acc + c.amount, 0) / group.claims.length
        : 500;

    const prompt = `
        Act as a claims assessor for a small community microinsurance group.
        The group is a Boda Boda (motorcycle taxi) association.
        Total funds available: ${totalPool}.
        Average claim amount historically: ${averageClaimAmount}.

        A new claim has been filed:
        Description: "${claim.description}"
        Amount: ${claim.amount}

        Assess this claim. Is the description plausible for a boda boda operator? Is the amount reasonable compared to the description, the average claim, and the total pool size?
        Provide a recommendation ('Approve', 'Deny', 'Needs Review') and a brief justification (one sentence).
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendation: {
                            type: Type.STRING,
                            enum: ['Approve', 'Deny', 'Needs Review'],
                            description: "Your recommendation for the claim."
                        },
                        justification: {
                            type: Type.STRING,
                            description: "A brief, one-sentence justification for your recommendation."
                        }
                    },
                    required: ["recommendation", "justification"]
                }
            }
        });
        
        const jsonResponse = JSON.parse(response.text);

        return {
            recommendation: jsonResponse.recommendation as 'Approve' | 'Deny' | 'Needs Review',
            justification: jsonResponse.justification,
        };

    } catch (error) {
        console.error("Error calling Gemini API for claim assessment:", error);
        throw new Error("Failed to get claim assessment from AI.");
    }
};
