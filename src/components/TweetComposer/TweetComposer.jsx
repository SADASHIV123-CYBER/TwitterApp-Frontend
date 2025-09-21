import React, { useState, useEffect, useCallback } from "react";
import Button from "../Button/Button";
import Card from "../Card/Card";
import { createTweet } from "../../api/tweetApi";

export default function TweetComposer({ onCreated }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <Card className="p-4">
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full bg-transparent resize-none outline-none text-gray-900 placeholder-gray-400"
        placeholder="What's happening?"
      />
      {previewUrl && (
        <div className="mt-3 flex items-start gap-3">
          <img src={previewUrl} alt="preview" className="w-36 h-36 object-cover rounded-md border" />
          <div className="flex-1">
            <div className="text-sm text-gray-700">Selected image</div>
            <div className="mt-2 flex gap-2">
              <Button text="Remove" onClickHandler={removeImage} styleType="secondary" />
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <label className="inline-block cursor-pointer">
            <input type="file" accept="image/png,image/jpeg" onChange={handleFileChange} className="hidden" />
            <span className="inline-block px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50">Add image</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button text={loading ? "Posting..." : "Tweet"} onClickHandler={submit} disabled={loading || (!text.trim() && !imageFile)} styleType="primary" />
        </div>
      </div>
    </Card>
  );
}
