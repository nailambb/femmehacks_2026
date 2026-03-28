import { useRef, useState } from 'react'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY;

export default function ClothingGenerator() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [base64, setBase64] = useState<{ data: string; mime: string } | null>(null);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [clothingType, setClothingType] = useState<string>("shirt");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImage(URL.createObjectURL(file));
    setGeneratedImage(null);
    setResponse("");

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64({ data: result.split(",")[1], mime: file.type });
    };
    reader.readAsDataURL(file);
  };

  const sendToGemini = async () => {
    if (!base64) return;
    setLoading(true);
    setResponse("Describing clothing...");
    setGeneratedImage(null);

    try {
      const describeRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `This image contains a ${clothingType}. Describe this ${clothingType} in detail including color, style, fit, and fabric. Be specific so an AI image generator can recreate it. Only describe the ${clothingType}, not the person.` },
                  { inline_data: { mime_type: base64.mime, data: base64.data } },
                ],
              },
            ],
          }),
        }
      );

      const describeData = await describeRes.json();
      const clothingDescription = describeData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!clothingDescription) {
        setResponse("Could not describe image");
        return;
      }

      console.log("Description:", clothingDescription);
      setResponse("Generating image...");

      const startRes = await fetch("/replicate-api/v1/models/black-forest-labs/flux-2-pro/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_REPLICATE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          input: {
            prompt: `Fashion product photo of a ${clothingType}: ${clothingDescription.slice(0, 250)}, white background, studio lighting, no model, no person`,
            num_outputs: 1,
          },
        }),
      });

      const predictionData = await startRes.json();
      console.log(predictionData);

      const imgUrl = Array.isArray(predictionData.output)
        ? predictionData.output[0]
        : predictionData.output;

      console.log("Image URL:", imgUrl);

      if (imgUrl) {
        setImageLoading(true);
        setGeneratedImage(imgUrl);
      } else {
        setResponse("No image: " + JSON.stringify(predictionData));
      }

    } catch (err) {
      setResponse("Error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

      <button onClick={() => fileInputRef.current?.click()}>Upload Image</button>

      {uploadedImage && (
        <div>
          <p>Uploaded:</p>
          <img src={uploadedImage} alt="uploaded" style={{ width: "100%", marginTop: 8 }} />

          <select
            value={clothingType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClothingType(e.target.value)}
            style={{ marginTop: 10, display: "block", padding: "8px", width: "100%" }}
          >
            <option value="shirt">Shirt / Top</option>
            <option value="pants">Pants / Bottoms</option>
            <option value="dress">Dress</option>
            <option value="jacket">Jacket / Outerwear</option>
            <option value="shoes">Shoes</option>
            <option value="accessory">Accessory</option>
          </select>

          <button onClick={sendToGemini} disabled={loading} style={{ marginTop: 10 }}>
            {loading ? response : "Generate Clothing Image"}
          </button>
        </div>
      )}

      {generatedImage && (
        <div>
          <p>Generated:</p>
          {imageLoading && <p>Loading image...</p>}
          <img
            src={generatedImage}
            alt="generated"
            style={{ width: "100%", marginTop: 8, display: imageLoading ? "none" : "block" }}
            onLoad={() => { setImageLoading(false); setResponse("Done!"); }}
            onError={() => { setImageLoading(false); setResponse("Image failed to load, try again"); }}
          />
        </div>
      )}

      {response && response !== "Done!" && (
        <p style={{ color: "red" }}>{response}</p>
      )}
    </div>
  );
}