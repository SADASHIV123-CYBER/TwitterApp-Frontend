import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import Button from "../Button/Button";
import Card from "../Card/Card";
import { createTweet } from "../../api/tweetApi";
import { ThemeContext } from "../../context/context";

function TweetComposer({ onCreated }) {
  const { darkMode } = useContext(ThemeContext);

  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // preview URL management
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleFileChange = useCallback((e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!["image/jpeg", "image/png"].includes(f.type)) {
      alert("Only JPG/PNG images are allowed.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert("Image should be under 5MB.");
      return;
    }
    setImageFile(f);
  }, []);

  const removeImage = useCallback(() => setImageFile(null), []);

  const submit = useCallback(async () => {
    const body = text.trim();
    if (!body && !imageFile) return;
    setLoading(true);
    try {
      let created = null;
      if (imageFile) {
        const fd = new FormData();
        fd.append("tweet", body);
        fd.append("tweetImage", imageFile);
        created = await createTweet(fd);
      } else {
        created = await createTweet(body);
      }

      const tweetObj = created ?? null;

      if (onCreated) {
        const hasAuthor =
          tweetObj &&
          typeof tweetObj === "object" &&
          (tweetObj.author && (tweetObj.author.userName || tweetObj.author.displayName));

        if (hasAuthor) {
          onCreated(tweetObj);
        } else {
          onCreated({ refresh: true });
        }
      }

      setText("");
      setImageFile(null);
    } catch (err) {
      console.error("Create tweet failed", err);
      alert(err?.response?.data?.message || "Failed to post tweet");
    } finally {
      setLoading(false);
    }
  }, [text, imageFile, onCreated]);

  // theme-aware styles (memoized for perf)
  const styles = useMemo(() => {
    return {
      container: `transition-colors duration-300 rounded-xl shadow-sm ${
        darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
      }`,
      textarea: `w-full resize-none outline-none text-sm sm:text-base transition-colors duration-300 p-3 rounded-lg ${
        darkMode
          ? "bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-700 focus:ring-2 focus:ring-yellow-400"
          : "bg-white text-gray-900 placeholder-gray-500 border border-gray-300 focus:ring-2 focus:ring-blue-500"
      }`,
      imagePreview: `w-36 h-36 object-cover rounded-md border ${
        darkMode ? "border-gray-600" : "border-gray-300"
      }`,
      addImageBtn: `inline-block px-3 py-2 text-sm rounded-md border transition-colors duration-200 ${
        darkMode
          ? "bg-gray-900 text-gray-200 border-gray-700 hover:bg-gray-800"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`,
      previewText: darkMode ? "text-gray-300" : "text-gray-700",
    };
  }, [darkMode]);

  return (
    <Card className={`p-4 ${styles.container}`}>
      {/* Tweet text input */}
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={styles.textarea}
        placeholder="What's happening?"
      />

      {/* Image preview */}
      {previewUrl && (
        <div className="mt-3 flex items-start gap-3">
          <img src={previewUrl} alt="preview" className={styles.imagePreview} />
          <div className="flex-1">
            <div className={`text-sm ${styles.previewText}`}>Selected image</div>
            <div className="mt-2 flex gap-2">
              <Button text="Remove" onClickHandler={removeImage} styleType="secondary" />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <label className="inline-block cursor-pointer">
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className={styles.addImageBtn}>Add image</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button
            text={loading ? "Posting..." : "Tweet"}
            onClickHandler={submit}
            disabled={loading || (!text.trim() && !imageFile)}
            styleType="primary"
          />
        </div>
      </div>
    </Card>
  );
}

export default React.memo(TweetComposer);
