import { createFileRoute } from "@tanstack/react-router";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef, useState } from "react";

export const Route = createFileRoute("/profilepage")({
  component: ProfilePage,
});

const SUGGESTED_SKILLS = [
  "Sewing", "Knitting", "Embroidery", "Pattern making",
  "Tailoring", "Alterations", "Dyeing & printing", "Upcycling",
];

function ProfilePage() {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");
  const updateUser = useMutation(api.users.updateUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const saveProfileImage = useMutation(api.users.saveProfileImage);

  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated) {
    return (
      <div className="h-[calc(100vh-57px)] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  if (user === undefined) {
    return (
      <div className="h-[calc(100vh-57px)] flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="h-[calc(100vh-57px)] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">User not found. Try signing out and back in.</p>
      </div>
    );
  }

  const currentSkills: string[] = user.skills ?? [];

  const openEdit = () => {
    setEditName(user.name ?? "");
    setEditEmail(user.email ?? "");
    setEditImagePreview(user.image ?? "");
    setEditImageFile(null);
    setEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    // Show local preview immediately
    setEditImagePreview(URL.createObjectURL(file));
  };

  const saveEdit = async () => {
    setEditSaving(true);
    try {
      // If user picked a new image file, upload it first
      if (editImageFile) {
        const uploadUrl = await generateUploadUrl();

        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": editImageFile.type },
          body: editImageFile,
        });

        if (!res.ok) throw new Error("Upload failed");

        const { storageId } = await res.json();
        await saveProfileImage({ storageId });
      }

      // Save name + email separately
      await updateProfile({
        name: editName || undefined,
        email: editEmail || undefined,
      });

      setEditing(false);
    } finally {
      setEditSaving(false);
    }
  };

  const addSkill = async (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || currentSkills.includes(trimmed)) return;
    setSaving(true);
    await updateUser({ skills: [...currentSkills, trimmed] });
    setSkillInput("");
    setSaving(false);
  };

  const removeSkill = async (skill: string) => {
    await updateUser({ skills: currentSkills.filter(s => s !== skill) });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const handleProficiencyChange = async (value: string) => {
    await updateUser({
      proficiencyLevel: value as "beginner" | "intermediate" | "advanced",
    });
  };

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col bg-white">

      {/* top bar */}
      <div className="border-b px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Profile</h1>
          <p className="text-xs text-muted-foreground">Manage your account and skills</p>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={openEdit}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-8 py-10 flex flex-col gap-10">

          {/* user info */}
          {!editing ? (
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                <AvatarFallback className="text-lg bg-muted">
                  {user.name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{user.name ?? "No name set"}</p>
                <p className="text-xs text-muted-foreground">{user.email ?? ""}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium">Edit Profile</p>

              {/* Avatar + file picker */}
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={editImagePreview} alt={editName} />
                  <AvatarFallback className="text-lg bg-muted">
                    {editName?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  {/* Hidden real file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Photo
                  </Button>
                  {editImageFile && (
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {editImageFile.name}
                    </p>
                  )}
                </div>
              </div>

              <Input
                placeholder="Name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="h-9 text-sm"
              />
              <Input
                placeholder="Email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                className="h-9 text-sm"
                type="email"
              />
              <div className="flex gap-2">
                <Button onClick={saveEdit} disabled={editSaving} size="sm" className="h-9 text-xs">
                  {editSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button onClick={() => setEditing(false)} variant="outline" size="sm" className="h-9 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="h-px bg-border" />

          {/* proficiency — unchanged */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-medium">Proficiency Level</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your overall sewing and crafting experience
              </p>
            </div>
            <Select value={user.proficiencyLevel ?? ""} onValueChange={handleProficiencyChange}>
              <SelectTrigger className="w-48 h-9 text-sm">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-px bg-border" />

          {/* skills — unchanged */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-medium">Skills</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add skills that describe your experience
              </p>
            </div>
            {currentSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentSkills.map(skill => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="cursor-pointer text-xs hover:bg-red-50 hover:text-red-500 transition-colors"
                    onClick={() => removeSkill(skill)}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No skills added yet.</p>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Type a skill and press Enter..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="h-9 text-sm"
              />
              <Button
                onClick={() => addSkill(skillInput)}
                disabled={saving || !skillInput.trim()}
                variant="outline"
                size="sm"
                className="h-9 text-xs"
              >
                Add
              </Button>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">
                Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.filter(s => !currentSkills.includes(s)).map(skill => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer text-xs hover:bg-muted transition-colors"
                    onClick={() => addSkill(skill)}
                  >
                    + {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}