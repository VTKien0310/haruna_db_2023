import { beforeEach, describe, expect, it } from "vitest";
import { TranslationService } from "@/modules/translation/TranslationService";
import { useTranslationStore } from "@/modules/translation/stores/TranslationStore";
import { BackendApiResult } from "@/ports/backend/BackendPortTypes";
import {
  makeBackendFake,
  queryError,
  queryResult,
} from "../../fakes/BackendFake";
import { makeToast } from "../../fakes/Collaborators";
import { makeHistory } from "../../factories/Records";
import { t } from "@/modules/translation/locales";

describe("TranslationService", () => {
  let backend: ReturnType<typeof makeBackendFake>;
  let toast: ReturnType<typeof makeToast>;
  let service: TranslationService;
  beforeEach(() => {
    backend = makeBackendFake();
    toast = makeToast();
    service = new TranslationService(backend.port, toast.service);
  });

  it("loads languages once and resolves unknown codes", async () => {
    backend.get.mockResolvedValue(
      BackendApiResult.ok([
        { code: "en", name: "English" },
        { code: "ja", name: "Japanese" },
        { code: "vi", name: "Vietnamese" },
      ]),
    );
    await service.loadSupportedLanguages();
    await service.loadSupportedLanguages();
    expect(backend.get).toHaveBeenCalledExactlyOnceWith(
      "translation/languages",
    );
    expect(service.resolveLanguageName("vi")).toBe("Vietnamese");
    expect(service.resolveLanguageName("xx")).toBe("xx");
    expect(useTranslationStore().isLoadingLanguages).toBe(false);
  });
  it("clears loading on language failure", async () => {
    backend.get.mockResolvedValue(BackendApiResult.err(new Error("offline")));
    await service.loadSupportedLanguages();
    expect(toast.error).toHaveBeenCalled();
    expect(useTranslationStore().isLoadingLanguages).toBe(false);
  });
  it("trims and translates once, then synchronizes histories", async () => {
    backend.post.mockResolvedValue(
      BackendApiResult.ok({ translated_text: "Hello" }),
    );
    backend.query(queryResult([makeHistory()], 1));
    expect(await service.translateIfNeeded("  こんにちは  ", "ja", "en")).toBe(
      "Hello",
    );
    expect(backend.post).toHaveBeenCalledWith("translation/translate", {
      source_text: "こんにちは",
      source_language: "ja",
      target_language: "en",
    });
    expect(
      await service.translateIfNeeded("こんにちは", "ja", "en"),
    ).toBeNull();
    expect(backend.post).toHaveBeenCalledTimes(1);
    expect(useTranslationStore().histories).toEqual([makeHistory()]);
    expect(useTranslationStore().latestHistories).toEqual([makeHistory()]);
  });
  it("allows retry after failed translation", async () => {
    backend.post.mockResolvedValue(BackendApiResult.err(new Error("offline")));
    expect(await service.translateIfNeeded("text", "ja", "en")).toBeNull();
    expect(useTranslationStore().lastTranslationKey).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(t("messages.translateFailed"));
  });
  it("paginates histories and prevents concurrent fetches", async () => {
    const query = backend.query(queryResult([makeHistory()], 12));
    const pending = service.fetchTranslationHistories(2);
    await service.fetchTranslationHistories(3);
    expect(useTranslationStore().isFetchingHistories).toBe(true);
    await pending;
    expect(query.range).toHaveBeenCalledWith(5, 9);
    expect(backend.spbClient.from).toHaveBeenCalledTimes(1);
    expect(useTranslationStore().currentHistoryPage).toBe(2);
    expect(useTranslationStore().totalHistoriesCount).toBe(12);
  });
  it.each([queryError(), queryResult(null, 0), queryResult([], null)])(
    "handles invalid history results %j",
    async (result) => {
      backend.query(result);
      await service.fetchTranslationHistories(1);
      expect(useTranslationStore().isFetchingHistories).toBe(false);
      expect(useTranslationStore().hasLoadedHistories).toBe(false);
      expect(toast.error).toHaveBeenCalled();
    },
  );
  it("selects a history and swaps/resets drafts", () => {
    const record = makeHistory();
    const draft = service.getDraftFromHistory(record);
    expect(service.isHistoryRecordActive(record, draft)).toBe(true);
    expect(service.swapDraft(draft)).toEqual({
      sourceLanguage: "en",
      targetLanguage: "ja",
      sourceText: "Hello",
      translatedText: "こんにちは",
    });
    expect(useTranslationStore().lastTranslationKey).toBeNull();
    expect(service.resetDraft(draft)).toEqual({
      ...draft,
      sourceText: "",
      translatedText: "",
    });
  });
  it("initializes with a selected history", async () => {
    backend.get.mockResolvedValue(BackendApiResult.ok([]));
    backend.query(queryResult([makeHistory()], 1));
    expect(await service.initialize("history-1")).toEqual(makeHistory());
  });
  it("resets all history state", async () => {
    backend.query(queryResult([makeHistory()], 1));
    await service.syncLatestTranslationHistories();
    service.resetHistories();
    expect(useTranslationStore()).toMatchObject({
      histories: [],
      latestHistories: [],
      totalHistoriesCount: 0,
      currentHistoryPage: 1,
      hasLoadedHistories: false,
      hasLoadedLatestHistories: false,
    });
  });
});
