"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useRateTeacher, useTeacherRating } from "@/lib/hooks/use-rate-teacher"

interface TeacherRatingFormProps {
  teacherId: string
}

export function TeacherRatingForm({ teacherId }: TeacherRatingFormProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const { data: ratingData } = useTeacherRating(teacherId)
  const rateTeacherMutation = useRateTeacher()

  const currentRating = ratingData?.rating || null
  const [selectedRating, setSelectedRating] = useState<number | null>(currentRating)

  // Update selected rating when rating data loads
  useEffect(() => {
    if (ratingData?.rating !== undefined) {
      setSelectedRating(ratingData.rating)
      if (ratingData.comment) {
        setComment(ratingData.comment)
      }
    }
  }, [ratingData])

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating)
  }

  const handleSubmit = () => {
    if (!selectedRating) {
      return
    }

    rateTeacherMutation.mutate(
      {
        teacherId,
        rating: selectedRating,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          setComment("")
        },
      }
    )
  }

  const displayRating = hoveredRating || selectedRating || 0

  return (
    <div className="space-y-3 p-3 bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
          {currentRating ? "Update Your Rating" : "Rate This Teacher"}
        </Label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRatingClick(rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(null)}
                className="focus:outline-none transition-transform hover:scale-110"
                disabled={rateTeacherMutation.isPending}
              >
                <Star
                  className={cn(
                    "w-5 h-5 transition-all",
                    rating <= displayRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  )}
                />
              </button>
            ))}
          </div>
          {selectedRating && (
            <span className="text-sm font-semibold text-muted-foreground">
              {selectedRating} / 5
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`comment-${teacherId}`} className="text-xs font-semibold text-muted-foreground">
          Comment (Optional)
        </Label>
        <Textarea
          id={`comment-${teacherId}`}
          placeholder="Share your experience with this teacher..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="text-xs resize-none"
          disabled={rateTeacherMutation.isPending}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedRating || rateTeacherMutation.isPending}
        size="sm"
        className="w-full"
      >
        {rateTeacherMutation.isPending
          ? "Submitting..."
          : currentRating
          ? "Update Rating"
          : "Submit Rating"}
      </Button>

      {currentRating && (
        <p className="text-xs text-muted-foreground text-center">
          Your current rating: {currentRating} / 5
        </p>
      )}
    </div>
  )
}

