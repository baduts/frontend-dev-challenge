/* eslint-disable @typescript-eslint/no-misused-promises */
import { type DateRange } from "react-day-picker";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { type FieldErrors, type UseFormRegister } from "react-hook-form";
import { type VoyageWithUnitTypes } from "~/models/voyages";
import { DatePickerWithRange } from "./ui/dateRangePIcker";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import MultipleSelector from "./ui/multiSelect";
import { type UnitType } from "@prisma/client";
import { type Option } from "./ui/multiSelect";

interface VoyageSheetProps {
  register: UseFormRegister<VoyageWithUnitTypes>;
  onSelectDate: (dateRange: DateRange | undefined) => void;
  onSelectOption: (options: Option[]) => void;
  onSubmit: (e: React.MouseEvent<HTMLElement>) => Promise<void>;
  unitTypes?: UnitType[];
  errors: FieldErrors<VoyageWithUnitTypes>;
}

export const VoyageSheet = ({
  onSelectDate,
  register,
  onSubmit,
  unitTypes,
  onSelectOption,
  errors,
}: VoyageSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="w-20">Create</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create Voyage</SheetTitle>
          <SheetDescription>
            Fill out the form to create your voyage
          </SheetDescription>
        </SheetHeader>
        <form>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portOfLoading" className="text-right">
                Port of loading
              </Label>
              <Input
                id="portOfLoading"
                className="col-span-3"
                required
                {...register("portOfLoading")}
              />
              {errors.portOfLoading && (
                <span>{errors.portOfLoading.message}</span>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portOfDischarge" className="text-right">
                Port of discharge
              </Label>
              <Input
                id="portOfDischarge"
                className="col-span-3"
                required
                {...register("portOfDischarge")}
              />
              {errors.portOfDischarge && (
                <span>{errors.portOfDischarge.message}</span>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vesselId" className="text-right">
                Vessel id
              </Label>
              <Input
                id="vesselId"
                className="col-span-3"
                required
                {...register("vessel")}
              />
            </div>
            {errors.vessel && <span>{errors.vessel.message}</span>}
            <DatePickerWithRange onSelectDate={onSelectDate} />
            {errors.arrival && <span>{errors.arrival.message}</span>}
            {errors.departure && <span>{errors.departure.message}</span>}
            <MultipleSelector
              onSelectOption={onSelectOption}
              options={
                unitTypes
                  ? [...unitTypes].map((unitType) => {
                      return { label: unitType.name, value: unitType.name };
                    })
                  : []
              }
            />
            {errors.unitTypes && <span>{errors.unitTypes.message}</span>}
          </div>
          <SheetFooter>
            <Button onClick={onSubmit}>Submit</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
