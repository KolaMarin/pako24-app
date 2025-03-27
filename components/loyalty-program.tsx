"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gift, Award, TrendingUp, Star } from "lucide-react"
import { useAuth } from "@/lib/auth"

interface LoyaltyLevel {
  name: string
  threshold: number
  benefits: string[]
  icon: React.ReactNode
}

interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  available: boolean
}

export function LoyaltyProgram() {
  const { user } = useAuth()
  const [points, setPoints] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([])

  const levels: LoyaltyLevel[] = [
    {
      name: "Bronze",
      threshold: 0,
      benefits: ["Njoftimet e ofertave speciale", "Përparësi në porosi"],
      icon: <Star className="h-5 w-5 text-amber-600" />,
    },
    {
      name: "Silver",
      threshold: 100,
      benefits: ["5% zbritje në transport", "Përparësi në shërbimin ndaj klientit", "Pikë të dyfishta për porositë"],
      icon: <Star className="h-5 w-5 text-gray-400" />,
    },
    {
      name: "Gold",
      threshold: 300,
      benefits: ["10% zbritje në transport", "Shërbim VIP", "Oferta ekskluzive", "Dërgesa falas për porositë mbi 100€"],
      icon: <Star className="h-5 w-5 text-yellow-400" />,
    },
    {
      name: "Platinum",
      threshold: 1000,
      benefits: [
        "15% zbritje në transport",
        "Menaxher personal i llogarisë",
        "Përparësi maksimale",
        "Dërgesa falas për të gjitha porositë",
      ],
      icon: <Award className="h-5 w-5 text-indigo-600" />,
    },
  ]

  const nextLevel = levels[currentLevel + 1]

  useEffect(() => {
    // In a real implementation, this would fetch from your API
    if (user) {
      // Mock data
      setPoints(120)

      // Determine current level
      for (let i = levels.length - 1; i >= 0; i--) {
        if (120 >= levels[i].threshold) {
          setCurrentLevel(i)
          break
        }
      }

      // Mock rewards
      setAvailableRewards([
        {
          id: "1",
          name: "Dërgesa Falas",
          description: "Dërgesa falas për porosinë tënde të ardhshme",
          pointsCost: 50,
          available: true,
        },
        {
          id: "2",
          name: "Zbritje 10%",
          description: "10% zbritje në porosinë tënde të ardhshme",
          pointsCost: 100,
          available: true,
        },
        {
          id: "3",
          name: "Përparësi VIP",
          description: "Përparësi VIP për 3 porositë e ardhshme",
          pointsCost: 200,
          available: false,
        },
      ])
    }
  }, [user, levels])

  const redeemReward = (rewardId: string) => {
    // In a real implementation, this would call your API
    console.log(`Redeeming reward ${rewardId}`)

    // Mock implementation
    setAvailableRewards(
      availableRewards.map((reward) => (reward.id === rewardId ? { ...reward, available: false } : reward)),
    )

    setPoints(points - availableRewards.find((r) => r.id === rewardId)!.pointsCost)

    // Show success message
    alert("Shpërblimi u kërkua me sukses! Do të aplikohet në porosinë tënde të ardhshme.")
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Programi i Besnikërisë</CardTitle>
          <CardDescription>Fitoni pikë dhe shpërblime për çdo porosi</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">Ju lutemi identifikohuni për të parë pikët dhe shpërblimet tuaja</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Identifikohu</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Programi i Besnikërisë</CardTitle>
            <CardDescription>Fitoni pikë dhe shpërblime për çdo porosi</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1.5">
            {levels[currentLevel].icon}
            <span>{levels[currentLevel].name}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Pikët tuaja</span>
            <span className="font-bold text-lg">{points}</span>
          </div>

          {nextLevel && (
            <>
              <Progress value={(points / nextLevel.threshold) * 100} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{levels[currentLevel].name}</span>
                <span>
                  {nextLevel.name} ({nextLevel.threshold - points} pikë më shumë)
                </span>
              </div>
            </>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-2">Përfitimet e nivelit tuaj</h3>
          <ul className="space-y-1">
            {levels[currentLevel].benefits.map((benefit, i) => (
              <li key={i} className="text-sm flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-2">Shpërblimet e disponueshme</h3>
          <div className="grid gap-3">
            {availableRewards
              .filter((r) => r.available)
              .map((reward) => (
                <div key={reward.id} className="border rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium">{reward.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{reward.description}</p>
                  </div>
                  <Button size="sm" disabled={points < reward.pointsCost} onClick={() => redeemReward(reward.id)}>
                    {reward.pointsCost} pikë
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

