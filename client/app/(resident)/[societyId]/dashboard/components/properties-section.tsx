import { Flat } from "./types";
import { Home } from "lucide-react";
import { Card, CardContent } from "@/components/card";

interface PropertiesSectionProps {
  flats: Flat[];
}

export const PropertiesSection = ({ flats }: PropertiesSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {flats.map((flat, index) => (
        <Card key={flat.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {index === 0 ? "Primary Property" : "Property"}
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {flat.address}
                </p>
                <p className="text-sm text-gray-500 mt-1">Size: {flat.size}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
