/**
 * aiContentService.js
 * Service for AI-generated lesson content:
 *   - Transcript (Whisper)
 *   - Summary Notes (OpenAI)
 *   - Quiz questions (OpenAI)
 *   - Flashcards (OpenAI)
 *
 * Architecture:
 *   React (5173) → Main Backend (8000) → Whisper Agent (8001)
 *   Frontend never calls Whisper agent directly.
 *
 * Endpoints used:
 *   POST /api/v1/ai-content/process/{lesson_id}
 *   GET  /api/v1/ai-content/{lesson_id}
 *   GET  /api/v1/ai-content/course/{course_id}
 *   DELETE /api/v1/ai-content/{lesson_id}
 *   GET  /api/v1/ai-content/health
 */

import apiClient from './api';

const AI_CONTENT_BASE = '/api/v1/ai-content';

const aiContentService = {

  // ══════════════════════════════════════════════════════════
  // Process a lesson's video to generate AI content
  // ══════════════════════════════════════════════════════════

  /**
   * Trigger AI content generation for a lesson.
   * Sends the video URL to the backend, which proxies to Whisper agent.
   *
   * @param {number} lessonId    — The lesson ID
   * @param {string} videoUrl    — Full URL or server path to the video
   * @param {string} lessonTitle — Title for context (optional)
   * @returns {Promise<Object>}  — { lesson_id, status, message }
   */
  processLesson: async (lessonId, videoUrl, lessonTitle = '') => {
    const res = await apiClient.post(
      `${AI_CONTENT_BASE}/process/${lessonId}`,
      {
        video_url: videoUrl,
        lesson_title: lessonTitle,
      }
    );
    return res.data;
  },

  // ══════════════════════════════════════════════════════════
  // Get AI content for a single lesson
  // ══════════════════════════════════════════════════════════

  /**
   * Get AI-generated content for a specific lesson.
   * If still processing, the backend polls the Whisper agent
   * and returns the latest status.
   *
   * @param {number} lessonId
   * @returns {Promise<Object>} — {
   *   lesson_id, status, progress,
   *   transcript, summary_notes, quiz, flashcards, error
   * }
   */
  getContent: async (lessonId) => {
    const res = await apiClient.get(
      `${AI_CONTENT_BASE}/${lessonId}`
    );
    return res.data;
  },

  // ══════════════════════════════════════════════════════════
  // Get all AI content for a course
  // ══════════════════════════════════════════════════════════

  /**
   * Get summary of all AI-generated content for lessons in a course.
   *
   * @param {number} courseId
   * @returns {Promise<Object>} — {
   *   course_id, total_lessons, processed_count,
   *   lessons: [{ lesson_id, status, has_summary, quiz_count, ... }]
   * }
   */
  getCourseContent: async (courseId) => {
    const res = await apiClient.get(
      `${AI_CONTENT_BASE}/course/${courseId}`
    );
    return res.data;
  },

  // ══════════════════════════════════════════════════════════
  // Delete AI content (for regeneration)
  // ══════════════════════════════════════════════════════════

  /**
   * Delete cached AI content for a lesson.
   * Call this before re-processing to force regeneration.
   *
   * @param {number} lessonId
   * @returns {Promise<Object>} — { message, lesson_id }
   */
  deleteContent: async (lessonId) => {
    const res = await apiClient.delete(
      `${AI_CONTENT_BASE}/${lessonId}`
    );
    return res.data;
  },

  // ══════════════════════════════════════════════════════════
  // Health check
  // ══════════════════════════════════════════════════════════

  /**
   * Check health of AI content service and Whisper agent.
   *
   * @returns {Promise<Object>} — {
   *   status, whisper_agent: { url, status },
   *   cached_lessons, active_tasks
   * }
   */
  checkHealth: async () => {
    try {
      const res = await apiClient.get(`${AI_CONTENT_BASE}/health`);
      return res.data;
    } catch (err) {
      return {
        status: 'error',
        whisper_agent: { status: 'unreachable' },
        error: err.message,
      };
    }
  },

  // ══════════════════════════════════════════════════════════
  // Poll until content is ready
  // ══════════════════════════════════════════════════════════

  /**
   * Poll the backend until AI content generation is complete.
   * Uses exponential backoff: starts at 2s, maxes at 8s.
   *
   * @param {number}   lessonId     — Lesson to poll
   * @param {function} onProgress   — Called with progress text on each poll
   * @param {number}   maxAttempts  — Max polls before giving up (default 120 = ~8 min)
   * @returns {Promise<Object>}     — Resolved content when status === 'completed'
   * @throws {Error}                — If status === 'failed' or timeout
   */
  pollUntilReady: (lessonId, onProgress, maxAttempts = 120) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      let interval = 2000; // Start at 2 seconds

      const poll = async () => {
        attempts++;
        try {
          const data = await aiContentService.getContent(lessonId);

          // Report progress
          const progressText =
            data.progress ||
            data.status ||
            `Processing... (attempt ${attempts})`;
          onProgress?.(progressText);

          // Completed — resolve
          if (data.status === 'completed') {
            resolve(data);
            return;
          }

          // Failed — reject
          if (data.status === 'failed') {
            reject(
              new Error(data.error || 'AI content generation failed')
            );
            return;
          }

          // Timeout — reject
          if (attempts >= maxAttempts) {
            reject(
              new Error(
                'AI content generation timed out. ' +
                'The video may be too long or the service is overloaded.'
              )
            );
            return;
          }

          // Still processing — schedule next poll with backoff
          // 2s → 3s → 4s → ... → 8s max
          interval = Math.min(interval + 500, 8000);
          setTimeout(poll, interval);

        } catch (err) {
          // Network error — retry a few times
          if (attempts < 5) {
            setTimeout(poll, 5000);
            return;
          }
          reject(
            new Error(
              `Lost connection to server: ${err.message}`
            )
          );
        }
      };

      // Start polling
      poll();
    });
  },

  // ══════════════════════════════════════════════════════════
  // Utility: check if a lesson has video content
  // ══════════════════════════════════════════════════════════

  /**
   * Extract video URL from a lesson object.
   * Handles both content-array and direct-field shapes.
   *
   * @param {Object} lesson — Lesson object from API
   * @returns {string|null} — Video URL or null
   */
  getVideoUrl: (lesson) => {
    if (!lesson) return null;
    // Shape 1: lesson.contents[] array
    if (lesson.contents && Array.isArray(lesson.contents)) {
      const videoContent = lesson.contents.find(
        (c) => c.content_type === 'video_url'
      );
      if (videoContent?.content) return videoContent.content;
    }
    // Shape 2: direct field
    if (lesson.video_url) return lesson.video_url;
    return null;
  },
};

export default aiContentService;