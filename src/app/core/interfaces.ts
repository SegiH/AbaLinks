export interface IAbaLink {
     ID: number;
     Name: string;
     URL: string;
     TypeID: number;
     OriginalItem: IAbaLink; // Saved copy of object in case user clicks on cancel when editing a row
     IsBeingEdited: boolean;
     IsModified: boolean;
     DeleteRow: boolean;
}