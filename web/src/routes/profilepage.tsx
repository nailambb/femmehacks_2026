import { createFileRoute } from "@tanstack/react-router";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/profilepage")({
  component: ProfilePage,
});

const SUGGESTED_SKILLS = [
  "Sewing",
  "Knitting",
  "Embroidery",
  "Pattern making",
  "Tailoring",
  "Alterations",
  "Dyeing & printing",
  "Upcycling",
];

function ProfilePage() {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );
  const updateUser = useMutation(api.users.updateUser);

  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-muted-foreground">User not found. Try signing out and back in.</p>
      </div>
    );
  }

  const currentSkills: string[] = user.skills ?? [];

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

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
            <AvatarFallback className="text-xl">
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user.name ?? "No name set"}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email ?? ""}</p>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Skills</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {currentSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentSkills.map(skill => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100 hover:text-red-600 transition-colors"
                  onClick={() => removeSkill(skill)}
                >
                  {skill} ×
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills added yet.</p>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Type a skill and press Enter..."
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            <Button
              onClick={() => addSkill(skillInput)}
              disabled={saving || !skillInput.trim()}
              variant="outline"
            >
              Add
            </Button>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.filter(s => !currentSkills.includes(s)).map(skill => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary transition-colors"
                  onClick={() => addSkill(skill)}
                >
                  + {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}