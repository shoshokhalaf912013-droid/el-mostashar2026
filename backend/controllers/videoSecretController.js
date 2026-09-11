// =========================================================
// backend/controllers/videoSecretController.js
// SUPER ADMIN ONLY - VIDEO SECRETS
// =========================================================

const admin = require("firebase-admin");

const {
  getFirestore,
} = require("firebase-admin/firestore");

// =========================================================
// DATABASE
// =========================================================
//
// IMPORTANT:
//
// The platform uses the named Firestore database:
//
//     el-mostashar2026
//
// Do NOT use:
//     admin.firestore()
//
// because that may resolve to the default database.
// =========================================================

function getDb() {
  return getFirestore(
    admin.app(),
    "el-mostashar2026"
  );
}

// =========================================================
// SUPER ADMIN CHECK
// =========================================================

function requireSuperAdmin(
  req,
  res
) {

  if (
    !req.user ||
    req.user.role !== "super-admin"
  ) {

    res.status(403).json({
      success: false,
      error:
        "Super Admin access required",
    });

    return false;
  }

  return true;
}

// =========================================================
// DATE SERIALIZATION
// =========================================================

function serializeTimestamp(
  value
) {

  if (!value) {
    return null;
  }

  try {

    if (
      typeof value.toDate ===
      "function"
    ) {

      return value
        .toDate()
        .toISOString();
    }

    if (
      value instanceof Date
    ) {

      return value.toISOString();
    }

    return value;

  } catch {

    return null;
  }
}

// =========================================================
// YOUTUBE ID EXTRACTION
// =========================================================

function extractYoutubeId(
  value
) {

  if (
    !value ||
    typeof value !== "string"
  ) {

    return null;
  }

  const url =
    value.trim();

  if (!url) {
    return null;
  }

  // -------------------------------------------------------
  // Plain YouTube video ID
  // -------------------------------------------------------

  if (
    /^[A-Za-z0-9_-]{11}$/.test(
      url
    )
  ) {

    return url;
  }

  // -------------------------------------------------------
  // Supported YouTube URLs
  // -------------------------------------------------------

  const patterns = [

    /youtube\.com\/watch\?[^#]*v=([A-Za-z0-9_-]{11})/i,

    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/i,

    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/i,

    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/i,

    /youtu\.be\/([A-Za-z0-9_-]{11})/i,

  ];

  for (
    const pattern of patterns
  ) {

    const match =
      url.match(pattern);

    if (
      match &&
      match[1]
    ) {

      return match[1];
    }
  }

  return null;
}

// =========================================================
// CREATE INTERNAL VIDEO KEY
// =========================================================

function createVideoKey() {

  const crypto =
    require("crypto");

  return crypto
    .randomBytes(32)
    .toString("base64url");
}

// =========================================================
// GET ALL LESSONS
// SUPER ADMIN ONLY
// =========================================================

exports.listLessons =
  async (
    req,
    res
  ) => {

    if (
      !requireSuperAdmin(
        req,
        res
      )
    ) {

      return;
    }

    try {

      const db =
        getDb();

      // ---------------------------------------------------
      // Load all lessons
      //
      // We intentionally avoid orderBy("createdAt")
      // because older documents may not contain that field.
      // ---------------------------------------------------

      const snapshot =
        await db
          .collection(
            "lessons"
          )
          .get();

      const lessons =
        snapshot.docs
          .map(
            (lessonDoc) => {

              const data =
                lessonDoc.data() ||
                {};

              return {

                id:
                  lessonDoc.id,

                title:
                  data.title ||
                  "بدون عنوان",

                gradeId:
                  data.gradeId ||
                  "",

                subjectId:
                  data.subjectId ||
                  "",

                unitId:
                  data.unitId ||
                  "",

                publicLessonId:
                  data.publicLessonId ||
                  "",

                active:
                  data.active !== false,

                createdAt:
                  serializeTimestamp(
                    data.createdAt
                  ),

                updatedAt:
                  serializeTimestamp(
                    data.updatedAt
                  ),

              };
            }
          );

      return res.json({

        success:
          true,

        lessons,

      });

    } catch (error) {

      console.error(
        "❌ listLessons error:",
        error
      );

      return res.status(
        500
      ).json({

        success:
          false,

        error:
          error.message ||
          "Failed to load lessons",

      });
    }
  };

// =========================================================
// LIST VIDEO SECRETS
// SUPER ADMIN ONLY
// =========================================================
//
// This endpoint is the ONLY place where the backend
// intentionally returns the real YouTube information.
// It is protected by:
//
// Firebase authentication
// +
// role === super-admin
//
// =========================================================

exports.listVideoSecrets =
  async (
    req,
    res
  ) => {

    if (
      !requireSuperAdmin(
        req,
        res
      )
    ) {

      return;
    }

    try {

      const db =
        getDb();

      // ---------------------------------------------------
      // Load lessons and videos
      // ---------------------------------------------------

      const [
        lessonsSnapshot,
        videosSnapshot,
      ] = await Promise.all([

        db
          .collection(
            "lessons"
          )
          .get(),

        db
          .collection(
            "lessonVideos"
          )
          .get(),

      ]);

      // ---------------------------------------------------
      // Build lesson map
      // ---------------------------------------------------

      const lessonMap =
        new Map();

      for (
        const lessonDoc of
          lessonsSnapshot.docs
      ) {

        lessonMap.set(
          lessonDoc.id,
          {
            ...(
              lessonDoc.data() ||
              {}
            ),
            id:
              lessonDoc.id,
          }
        );
      }

      // ---------------------------------------------------
      // Build result
      // ---------------------------------------------------

      const videos =
        videosSnapshot.docs
          .map(
            (videoDoc) => {

              const videoData =
                videoDoc.data() ||
                {};

              const lessonId =
                videoDoc.id;

              const lesson =
                lessonMap.get(
                  lessonId
                ) || {};

              const youtubeVideoId =
                videoData.youtubeVideoId ||
                null;

              return {

                // -----------------------------------------
                // Identity
                // -----------------------------------------

                lessonId,

                title:
                  lesson.title ||
                  "بدون عنوان",

                gradeId:
                  lesson.gradeId ||
                  videoData.gradeId ||
                  "",

                subjectId:
                  lesson.subjectId ||
                  videoData.subjectId ||
                  "",

                unitId:
                  lesson.unitId ||
                  videoData.unitId ||
                  "",

                publicLessonId:
                  lesson.publicLessonId ||
                  videoData.publicLessonId ||
                  "",

                // -----------------------------------------
                // SECRET VIDEO DATA
                // -----------------------------------------

                videoKey:
                  videoData.videoKey ||
                  null,

                videoType:
                  videoData.videoType ||
                  "youtube",

                youtubeVideoId,

                youtubeUrl:
                  youtubeVideoId
                    ? `https://www.youtube.com/watch?v=${youtubeVideoId}`
                    : "",

                embedUrl:
                  youtubeVideoId
                    ? `https://www.youtube.com/embed/${youtubeVideoId}`
                    : "",

                updatedAt:
                  serializeTimestamp(
                    videoData.updatedAt
                  ),

                updatedBy:
                  videoData.updatedBy ||
                  null,

              };
            }
          );

      return res.json({

        success:
          true,

        videos,

      });

    } catch (error) {

      console.error(
        "❌ listVideoSecrets error:",
        error
      );

      return res.status(
        500
      ).json({

        success:
          false,

        error:
          error.message ||
          "Failed to load video secrets",

      });
    }
  };

// =========================================================
// GET ONE VIDEO SECRET
// SUPER ADMIN ONLY
// =========================================================

exports.getVideoSecret =
  async (
    req,
    res
  ) => {

    if (
      !requireSuperAdmin(
        req,
        res
      )
    ) {

      return;
    }

    try {

      const lessonId =
        String(
          req.params.lessonId ||
            ""
        ).trim();

      if (!lessonId) {

        return res.status(
          400
        ).json({

          success:
            false,

          error:
            "lessonId is required",

        });
      }

      const db =
        getDb();

      // ---------------------------------------------------
      // Video
      // ---------------------------------------------------

      const videoSnap =
        await db
          .collection(
            "lessonVideos"
          )
          .doc(
            lessonId
          )
          .get();

      if (
        !videoSnap.exists
      ) {

        return res.status(
          404
        ).json({

          success:
            false,

          error:
            "Video secret not found",

        });
      }

      const videoData =
        videoSnap.data() ||
        {};

      // ---------------------------------------------------
      // Lesson
      // ---------------------------------------------------

      const lessonSnap =
        await db
          .collection(
            "lessons"
          )
          .doc(
            lessonId
          )
          .get();

      const lessonData =
        lessonSnap.exists
          ? lessonSnap.data() || {}
          : {};

      // ---------------------------------------------------
      // YouTube ID
      // ---------------------------------------------------

      const youtubeVideoId =
        videoData.youtubeVideoId ||
        null;

      return res.json({

        success:
          true,

        video: {

          lessonId,

          title:
            lessonData.title ||
            "بدون عنوان",

          gradeId:
            lessonData.gradeId ||
            videoData.gradeId ||
            "",

          subjectId:
            lessonData.subjectId ||
            videoData.subjectId ||
            "",

          unitId:
            lessonData.unitId ||
            videoData.unitId ||
            "",

          publicLessonId:
            lessonData.publicLessonId ||
            videoData.publicLessonId ||
            "",

          videoKey:
            videoData.videoKey ||
            null,

          videoType:
            videoData.videoType ||
            "youtube",

          youtubeVideoId,

          youtubeUrl:
            youtubeVideoId
              ? `https://www.youtube.com/watch?v=${youtubeVideoId}`
              : "",

          embedUrl:
            youtubeVideoId
              ? `https://www.youtube.com/embed/${youtubeVideoId}`
              : "",

          updatedAt:
            serializeTimestamp(
              videoData.updatedAt
            ),

          updatedBy:
            videoData.updatedBy ||
            null,

        },

      });

    } catch (error) {

      console.error(
        "❌ getVideoSecret error:",
        error
      );

      return res.status(
        500
      ).json({

        success:
          false,

        error:
          error.message ||
          "Failed to load video secret",

      });
    }
  };

// =========================================================
// SAVE / UPDATE VIDEO SECRET
// SUPER ADMIN ONLY
// =========================================================
//
// URL is accepted here and nowhere else.
//
// Example:
//
// POST /api/video-secrets/{REAL_LESSON_DOCUMENT_ID}
//
// body:
//
// {
//   "youtubeUrl":
//     "https://www.youtube.com/watch?v=XXXXXXXXXXX"
// }
//
// =========================================================

exports.saveVideoSecret =
  async (
    req,
    res
  ) => {

    if (
      !requireSuperAdmin(
        req,
        res
      )
    ) {

      return;
    }

    try {

      const lessonId =
        String(
          req.params.lessonId ||
            ""
        ).trim();

      const youtubeUrl =
        typeof req.body?.youtubeUrl ===
        "string"
          ? req.body.youtubeUrl.trim()
          : "";

      // ---------------------------------------------------
      // Validate lesson ID
      // ---------------------------------------------------

      if (!lessonId) {

        return res.status(
          400
        ).json({

          success:
            false,

          error:
            "lessonId is required",

        });
      }

      // ---------------------------------------------------
      // Validate YouTube URL
      // ---------------------------------------------------

      const youtubeVideoId =
        extractYoutubeId(
          youtubeUrl
        );

      if (!youtubeVideoId) {

        return res.status(
          400
        ).json({

          success:
            false,

          error:
            "Invalid YouTube URL",

        });
      }

      const db =
        getDb();

      // ---------------------------------------------------
      // Verify REAL lesson document
      // ---------------------------------------------------

      const lessonRef =
        db
          .collection(
            "lessons"
          )
          .doc(
            lessonId
          );

      const lessonSnap =
        await lessonRef.get();

      if (
        !lessonSnap.exists
      ) {

        return res.status(
          404
        ).json({

          success:
            false,

          error:
            "Lesson not found",

        });
      }

      const lessonData =
        lessonSnap.data() ||
        {};

      // ---------------------------------------------------
      // Generate new internal key
      // ---------------------------------------------------

      const videoKey =
        createVideoKey();

      // ---------------------------------------------------
      // Save protected video
      // ---------------------------------------------------
      //
      // IMPORTANT:
      //
      // The real YouTube ID exists in Firestore here.
      //
      // Students do NOT have direct Firestore access
      // to lessonVideos.
      //
      // Normal playback endpoint does NOT return this ID.
      //
      // Only Super Admin secret endpoints do.
      //
      // ---------------------------------------------------

      const videoRef =
        db
          .collection(
            "lessonVideos"
          )
          .doc(
            lessonId
          );

      await videoRef.set({

        lessonId,

        publicLessonId:
          lessonData.publicLessonId ||
          null,

        videoKey,

        youtubeVideoId,

        videoType:
          "youtube",

        gradeId:
          lessonData.gradeId ||
          null,

        subjectId:
          lessonData.subjectId ||
          null,

        unitId:
          lessonData.unitId ||
          null,

        updatedAt:
          admin.firestore
            .FieldValue
            .serverTimestamp(),

        updatedBy:
          req.user.uid,

      }, {
        merge:
          true,
      });

      // ---------------------------------------------------
      // Remove legacy video fields from lesson
      // ---------------------------------------------------
      //
      // We do this only after the protected video document
      // has been written successfully.
      //
      // ---------------------------------------------------

      await lessonRef.update({

        videoUrl:
          admin.firestore
            .FieldValue
            .delete(),

        videoLink:
          admin.firestore
            .FieldValue
            .delete(),

        videoType:
          admin.firestore
            .FieldValue
            .delete(),

        video:
          admin.firestore
            .FieldValue
            .delete(),

      });

      // ---------------------------------------------------
      // Return secret
      // ---------------------------------------------------
      //
      // This response is ONLY available to super-admin.
      //
      // The normal student playback endpoint does not
      // return these fields.
      //
      // ---------------------------------------------------

      return res.json({

        success:
          true,

        message:
          "Video secret saved successfully",

        video: {

          lessonId,

          publicLessonId:
            lessonData.publicLessonId ||
            null,

          videoKey,

          youtubeVideoId,

          youtubeUrl:
            `https://www.youtube.com/watch?v=${youtubeVideoId}`,

          embedUrl:
            `https://www.youtube.com/embed/${youtubeVideoId}`,

        },

      });

    } catch (error) {

      console.error(
        "❌ saveVideoSecret error:",
        error
      );

      return res.status(
        500
      ).json({

        success:
          false,

        error:
          error.message ||
          "Failed to save video secret",

      });
    }
  };

// =========================================================
// DELETE VIDEO SECRET
// SUPER ADMIN ONLY
// =========================================================

exports.deleteVideoSecret =
  async (
    req,
    res
  ) => {

    if (
      !requireSuperAdmin(
        req,
        res
      )
    ) {

      return;
    }

    try {

      const lessonId =
        String(
          req.params.lessonId ||
            ""
        ).trim();

      if (!lessonId) {

        return res.status(
          400
        ).json({

          success:
            false,

          error:
            "lessonId is required",

        });
      }

      const db =
        getDb();

      const videoRef =
        db
          .collection(
            "lessonVideos"
          )
          .doc(
            lessonId
          );

      const videoSnap =
        await videoRef.get();

      if (
        !videoSnap.exists
      ) {

        return res.status(
          404
        ).json({

          success:
            false,

          error:
            "Video secret not found",

        });
      }

      /*
       * Delete only the protected video document.
       *
       * We intentionally do NOT recreate old videoUrl
       * fields inside lessons.
       */

      await videoRef.delete();

      return res.json({

        success:
          true,

        message:
          "Video secret deleted",

        lessonId,

      });

    } catch (error) {

      console.error(
        "❌ deleteVideoSecret error:",
        error
      );

      return res.status(
        500
      ).json({

        success:
          false,

        error:
          error.message ||
          "Failed to delete video secret",

      });
    }
  };