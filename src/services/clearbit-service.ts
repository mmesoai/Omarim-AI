
'use server';
/**
 * @fileOverview A server-side service for interacting with the Clearbit API.
 */

/**
 * Enriches a lead's email to find more information.
 * @param {string} email - The email address to enrich.
 * @returns {Promise<any>} - The enrichment data from Clearbit.
 */
export async function enrichLead(email: string): Promise<any> {
    const apiKey = process.env.CLEARBIT_API_KEY;

    if (!apiKey) {
        console.warn("Clearbit API Key is not set in environment variables.");
        return { error: "Clearbit integration is not configured." };
    }

    try {
        const response = await fetch(`https://person.clearbit.com/v2/people/find?email=${email}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Clearbit API responded with status: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error fetching from Clearbit:", error);
        return { error: `Failed to enrich lead: ${error.message}` };
    }
}
