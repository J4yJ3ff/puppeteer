"use client"

import type React from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

interface ProductData {
  title?: string
  price?: string
  code?: string
  range?: string
  short_description?: string
  long_description?: string
  images?: string[]
  features?: string[]
  technical_details?: Record<string, string>
}

interface ResultsProps {
  data: ProductData | null
}

export default function Results({ data: initialData }: ResultsProps) {
  const [data, setData] = useState<ProductData | null>(initialData)

  const processDescription = (description?: string) => {
    if (!description) return ""
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = description
    return tempDiv.innerHTML
  }

  useEffect(() => {
    if (initialData) {
      const processedData = {
        ...initialData,
        short_description: processDescription(initialData.short_description),
        long_description: processDescription(initialData.long_description),
        features: initialData.features?.map(processDescription),
      }
      setData(processedData)
    }
  }, [initialData])

  if (!data) return null

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((prevData) => ({
      ...prevData!,
      price: e.target.value,
    }))
  }

  return (
    <div className="mt-8 p-4 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Scraped Data</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">{data.title || "No title available"}</h3>
          <div className="flex items-center mb-4">
            <label htmlFor="price" className="mr-2 font-semibold">
              Price:
            </label>
            <Input id="price" type="text" value={data.price || ""} onChange={handlePriceChange} className="w-32" />
          </div>
          {data.code && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Code:</h4>
              <p>{data.code}</p>
            </div>
          )}
          {data.range && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Range:</h4>
              <p>{data.range}</p>
            </div>
          )}
          {data.short_description && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Description:</h4>
              <div dangerouslySetInnerHTML={{ __html: data.short_description }} />
            </div>
          )}
          {data.features && data.features.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="list-disc list-inside">
                {data.features.map((feature, index) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: feature }} />
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          {data.images && data.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {data.images.map((img, index) => (
                <div key={index} className="relative h-48">
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`Product image ${index + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-lg"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p>No images available</p>
          )}
        </div>
      </div>
    </div>
  )
}

