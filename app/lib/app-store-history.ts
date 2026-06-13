import type { AnalysisResult, ChildProfile, Listing } from "./types";

export type AppStoreEvaluateInputMode = "screenshot" | "link" | "manual";

export type AppStoreSavedEvaluation = {
  id: string;
  createdAt: string;
  listing: Listing;
  analysis: AnalysisResult;
  sellerMessage: string;
  childNickname?: string;
  childSnapshot: ChildProfile;
  inputMode: AppStoreEvaluateInputMode;
  screenshotName?: string;
  savedAt: string;
  favorite: boolean;
};

export type AppStoreSavedEvaluationDraft = Omit<
  AppStoreSavedEvaluation,
  "createdAt" | "favorite" | "id" | "savedAt"
>;

export type AppStoreSavedEvaluationWriteResult = {
  evaluation: AppStoreSavedEvaluation;
  evaluations: AppStoreSavedEvaluation[];
  wasDuplicate: boolean;
};

export function mergeAppStoreSavedEvaluation(
  existing: AppStoreSavedEvaluation[],
  evaluation: AppStoreSavedEvaluationDraft,
  options: { id: string; now: string },
): AppStoreSavedEvaluationWriteResult {
  const duplicateIndex = existing.findIndex(
    (savedEvaluation) => appStoreEvaluationSignature(savedEvaluation) === appStoreEvaluationSignature(evaluation),
  );

  if (duplicateIndex >= 0) {
    const duplicate = {
      ...existing[duplicateIndex],
      ...evaluation,
      id: existing[duplicateIndex].id,
      createdAt: existing[duplicateIndex].createdAt || existing[duplicateIndex].savedAt || options.now,
      savedAt: options.now,
      favorite: existing[duplicateIndex].favorite,
    };
    return {
      evaluation: duplicate,
      evaluations: [duplicate, ...existing.filter((_, index) => index !== duplicateIndex)].slice(0, 10),
      wasDuplicate: true,
    };
  }

  const next: AppStoreSavedEvaluation = {
    ...evaluation,
    id: options.id,
    createdAt: options.now,
    savedAt: options.now,
    favorite: false,
  };
  return {
    evaluation: next,
    evaluations: [next, ...existing].slice(0, 10),
    wasDuplicate: false,
  };
}

export function appStoreEvaluationSignature(
  evaluation: Pick<
    AppStoreSavedEvaluation,
    "childSnapshot" | "inputMode" | "listing" | "screenshotName"
  >,
) {
  return JSON.stringify({
    listing: normalizeRecord(evaluation.listing),
    childSnapshot: normalizeRecord(evaluation.childSnapshot),
    inputMode: normalizeValue(evaluation.inputMode),
    screenshotName: normalizeValue(evaluation.screenshotName),
  });
}

function normalizeRecord(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [
        key,
        Array.isArray(value)
          ? value.map(normalizeValue)
          : normalizeValue(value),
      ]),
  );
}

function normalizeValue(value: unknown) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}
