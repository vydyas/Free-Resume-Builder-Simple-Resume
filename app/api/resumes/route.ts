import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../lib/auth';
import { supabaseAdmin } from '../lib/supabase-server';
import { errorResponse, ApiError } from '../lib/errors';
import { createResumeSchema } from '../lib/validation';
import { defaultResumeContent } from '@/data/default-resume-content';
import { defaultConfig } from '@/lib/resume-config';

/**
 * @openapi
 * /resumes:
 *   get:
 *     summary: Get all resumes
 *     description: Retrieve all active resumes for the authenticated user, ordered by creation date (newest first)
 *     tags: [Resumes]
 *     security:
 *       - ClerkAuth: []
 *     responses:
 *       200:
 *         description: List of resumes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resumes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resume'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found - Please sync your account first
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    // Get user's UUID from clerk_user_id
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      throw new ApiError(404, 'User not found. Please sync your account first.');
    }

    const { data, error } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ resumes: data || [] });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * @openapi
 * /resumes:
 *   post:
 *     summary: Create a new resume
 *     description: Create a new resume with provided data. All fields are optional.
 *     tags: [Resumes]
 *     security:
 *       - ClerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Software Engineer Resume
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               headline:
 *                 type: string
 *                 example: Software Engineer
 *               summary:
 *                 type: string
 *                 example: Experienced developer with 5+ years...
 *               location:
 *                 type: string
 *                 example: San Francisco, CA
 *               phoneNumber:
 *                 type: string
 *                 example: +1 (555) 123-4567
 *               linkedinId:
 *                 type: string
 *                 example: johndoe
 *               githubId:
 *                 type: string
 *                 example: johndoe
 *               positions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Position'
 *               educations:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Education'
 *               skills:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Skill'
 *               projects:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Project'
 *               certifications:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Certification'
 *               config:
 *                 $ref: '#/components/schemas/ResumeConfig'
 *               template:
 *                 type: string
 *                 example: default
 *               zoom:
 *                 type: integer
 *                 minimum: 50
 *                 maximum: 200
 *                 example: 100
 *     responses:
 *       201:
 *         description: Resume created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resume:
 *                   $ref: '#/components/schemas/Resume'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const body = await request.json();
    const validatedData = createResumeSchema.parse(body);

    // Get user's UUID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      throw new ApiError(
        404,
        'User not found. Please sync your account first by calling POST /api/users/sync'
      );
    }

    // Merge provided data with default content (provided data takes precedence)
    // For arrays, use defaults only if not provided or empty
    const resumeData = {
      first_name: validatedData.firstName ?? defaultResumeContent.firstName,
      last_name: validatedData.lastName ?? defaultResumeContent.lastName,
      email: validatedData.email ?? defaultResumeContent.email,
      headline: validatedData.headline ?? defaultResumeContent.headline,
      summary: validatedData.summary ?? defaultResumeContent.summary,
      location: validatedData.location ?? defaultResumeContent.location,
      phone_number: validatedData.phoneNumber ?? defaultResumeContent.phoneNumber,
      linkedin_id: validatedData.linkedinId ?? defaultResumeContent.linkedinId,
      github_id: validatedData.githubId ?? defaultResumeContent.githubId,
      positions: (validatedData.positions && validatedData.positions.length > 0) 
        ? validatedData.positions 
        : defaultResumeContent.positions,
      educations: (validatedData.educations && validatedData.educations.length > 0)
        ? validatedData.educations
        : defaultResumeContent.educations,
      skills: (validatedData.skills && validatedData.skills.length > 0)
        ? validatedData.skills
        : defaultResumeContent.skills,
      projects: validatedData.projects ?? defaultResumeContent.projects,
      certifications: (validatedData.certifications && validatedData.certifications.length > 0)
        ? validatedData.certifications
        : defaultResumeContent.certifications,
      custom_sections: validatedData.customSections ?? defaultResumeContent.customSections,
    };

    const { data, error } = await supabaseAdmin
      .from('resumes')
      .insert({
        user_id: user.id,
        name: validatedData.name || 'My Resume',
        ...resumeData,
        config: validatedData.config ?? defaultConfig,
        template: validatedData.template ?? 'default',
        zoom: validatedData.zoom ?? 100,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ resume: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
