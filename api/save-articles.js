/**
 * Vercel Serverless Function: Save Articles to GitHub
 *
 * This endpoint:
 * 1. Receives updated articles JSON from the admin panel
 * 2. Validates the admin password
 * 3. Commits the changes to GitHub using the GitHub REST API
 * 4. Triggers a Vercel rebuild automatically
 *
 * Required environment variables in Vercel:
 * - ADMIN_PASSWORD: Password for admin access
 * - GITHUB_TOKEN: Personal Access Token with repo permissions
 * - GITHUB_REPO: Repository in format "owner/repo" (e.g., "omiahi/melmiit")
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password, articles } = req.body;

  // Validate password
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Validate articles data
  if (!Array.isArray(articles)) {
    return res.status(400).json({ error: 'Invalid articles data' });
  }

  // Get GitHub credentials from environment
  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = process.env.GITHUB_REPO || 'omiahi/melmiit';

  if (!githubToken) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }

  try {
    // Step 1: Get current file SHA (required for updating)
    const filePathInRepo = 'content/articles.json';
    const getFileUrl = `https://api.github.com/repos/${githubRepo}/contents/${filePathInRepo}`;

    const getResponse = await fetch(getFileUrl, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    let sha = null;
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }

    // Step 2: Prepare new content (base64 encoded)
    const content = JSON.stringify(articles, null, 2);
    const contentBase64 = Buffer.from(content).toString('base64');

    // Step 3: Commit the file to GitHub
    const commitUrl = `https://api.github.com/repos/${githubRepo}/contents/${filePathInRepo}`;
    const commitPayload = {
      message: 'Update articles from admin panel',
      content: contentBase64,
      branch: 'main',
    };

    // Include SHA if file exists (update), otherwise it's a new file (create)
    if (sha) {
      commitPayload.sha = sha;
    }

    const commitResponse = await fetch(commitUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commitPayload),
    });

    if (!commitResponse.ok) {
      const errorData = await commitResponse.json();
      throw new Error(errorData.message || 'Failed to commit to GitHub');
    }

    const commitData = await commitResponse.json();

    // Success! Vercel will auto-redeploy on git push
    return res.status(200).json({
      success: true,
      message: 'Articles saved successfully',
      commit: commitData.commit.sha,
    });

  } catch (error) {
    console.error('Error saving articles:', error);
    return res.status(500).json({
      error: 'Failed to save articles: ' + error.message,
    });
  }
}
