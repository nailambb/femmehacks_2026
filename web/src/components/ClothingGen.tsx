import { useRef, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY;

export default function ClothingGenerator() {
  const user = useQuery(api.users.getCurrentUser);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [base64, setBase64] = useState<{ data: string; mime: string } | null>(null);
  const [response, setResponse] = useState<string>("");
  const [alteration, setAlteration] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [clothingType, setClothingType] = useState<string>("shirt");
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedImage(URL.createObjectURL(file));
    setGeneratedImage(null);
    setResponse("");
    setAlteration("");
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
    setResponse("Analyzing...");
    setGeneratedImage(null);
    setAlteration("");

    const skills = user?.skills?.join(", ") || "no specific skills listed";
    const proficiency = user?.proficiencyLevel || "beginner";

    try {
      const describeRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `This image contains a ${clothingType}. The user has the following sewing/crafting skills: ${skills}. Their proficiency level is: ${proficiency}.

Do two things:
1. Describe the ${clothingType} in detail (color, style, fit, fabric).
2. Suggest ONE specific DIY alteration appropriate for a ${proficiency} skill level (e.g. cinching the waist, making it off-shoulder, cropping, distressing, tie-dye, patchwork, embroidery, etc).

Respond in this exact format:
DESCRIPTION: [detailed description of the clothing]
ALTERATION: [specific alteration suggestion with brief how-to instructions]
ALTERED_PROMPT: [detailed image generation prompt of what the ${clothingType} looks like AFTER the alteration, white background, no person, product photo style]`
                },
                { inline_data: { mime_type: base64.mime, data: base64.data } },
              ],
            }],
          }),
        }
      );

      const describeData = await describeRes.json();
      const fullResponse = describeData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!fullResponse) {
        setResponse("Could not describe image");
        return;
      }

      console.log("Gemini response:", fullResponse);

      const alterationMatch = fullResponse.match(/ALTERATION:\s*(.+?)(?=ALTERED_PROMPT:|$)/s);
      const promptMatch = fullResponse.match(/ALTERED_PROMPT:\s*(.+?)$/s);

      const alterationText = alterationMatch?.[1]?.trim() || "Custom alteration";
      const imagePrompt = promptMatch?.[1]?.trim() || fullResponse;

      setAlteration(alterationText);
      setResponse("Generating...");

      const startRes = await fetch("/replicate-api/v1/models/black-forest-labs/flux-2-pro/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_REPLICATE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          input: {
            prompt: `Fashion product photo, white background, studio lighting, no model, no person: ${imagePrompt.slice(0, 400)}`,
            num_outputs: 1,
          },
        }),
      });

      const predictionData = await startRes.json();
      const imgUrl = Array.isArray(predictionData.output)
        ? predictionData.output[0]
        : predictionData.output;

      if (imgUrl) {
        setImageLoading(true);
        setGeneratedImage(imgUrl);
      } else {
        setResponse("No image returned");
      }

    } catch (err) {
      setResponse("Error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col bg-white">

      {/* top bar */}
      <div className="border-b px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Studio</h1>
          <p className="text-xs text-muted-foreground">Upload a piece, generate a new look</p>
        </div>
        {uploadedImage && (
          <Select value={clothingType} onValueChange={setClothingType}>
            <SelectTrigger className="w-44 h-8 text-sm">
              <SelectValue placeholder="Clothing type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shirt">Shirt / Top</SelectItem>
              <SelectItem value="pants">Pants / Bottoms</SelectItem>
              <SelectItem value="dress">Dress</SelectItem>
              <SelectItem value="jacket">Jacket / Outerwear</SelectItem>
              <SelectItem value="shoes">Shoes</SelectItem>
              <SelectItem value="accessory">Accessory</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* main canvas */}
      <div className="flex-1 grid grid-cols-2 divide-x overflow-hidden">

        {/* LEFT — upload */}
        <div className="flex flex-col">
          <div className="px-8 py-4 border-b flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Original</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadedImage ? "Replace" : "Upload"}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFile}
          />

          <div className="flex-1 flex items-center justify-center p-8">
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="uploaded"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full max-w-sm max-h-80 border-2 border-dashed border-muted rounded-xl flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors group"
              >
                <div className="h-10 w-10 rounded-full border-2 border-current flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  +
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Drop your piece here</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT — generated */}
        <div className="flex flex-col">
          <div className="px-8 py-4 border-b flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Generated</span>
            {generatedImage && (
              <Badge variant="secondary" className="text-xs font-normal">
                AI
              </Badge>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center p-8">
            {loading ? (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">{response}</p>
              </div>
            ) : generatedImage ? (
              <>
                {imageLoading && (
                  <div className="w-full max-w-sm aspect-square rounded-xl bg-muted animate-pulse" />
                )}
                <img
                  src={generatedImage}
                  alt="generated"
                  className="max-h-full max-w-full object-contain rounded-lg"
                  style={{ display: imageLoading ? "none" : "block" }}
                  onLoad={() => { setImageLoading(false); setResponse("Done!"); }}
                  onError={() => { setImageLoading(false); setResponse("Image failed to load"); }}
                />
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Your generated image will appear here</p>
              </div>
            )}
          </div>

          {/* alteration suggestion */}
          {alteration && !loading && (
            <div className="px-8 py-4 border-t bg-muted/30">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">✂️ DIY Suggestion</p>
              <p className="text-sm">{alteration}</p>
            </div>
          )}
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t px-8 py-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {response && response !== "Done!" && !loading ? response : "Ready"}
        </p>
        <Button
          onClick={sendToGemini}
          disabled={loading || !uploadedImage}
          className="px-8"
        >
          {loading ? "Generating..." : "Generate →"}
        </Button>
      </div>

    </div>
  );
}