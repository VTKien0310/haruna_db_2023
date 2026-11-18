import { PtoTransactionCause } from "@/modules/attendance/AttendanceEntities";
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import AttendanceTransactions from "@/modules/attendance/components/AttendanceTransactions.vue";
import { appMountOptions } from "../../support/mountApp";
import { transaction } from "./AttendanceFixtures";

describe("AttendanceTransactions", () => {
  it("shows friendly causes and reserves color for increases and excess", () => {
    const options = appMountOptions();
    options.global.plugins.push(
      createRouter({ history: createMemoryHistory(), routes: [] }),
    );
    const wrapper = mount(AttendanceTransactions, {
      ...options,
      props: {
        rows: [
          transaction({
            id: "decrease",
            cause: PtoTransactionCause.CHECK_IN_CREATE,
            type: 0,
          }),
          transaction({
            id: "increase",
            cause: PtoTransactionCause.TIME_OFF_UPDATE,
            type: 1,
            value: 80,
            exceed_bank_value: 20,
          }),
          transaction({
            id: "plain-decrease",
            cause: PtoTransactionCause.TIME_OFF_CREATE,
            type: 0,
            value: 60,
            exceed_bank_value: 0,
          }),
          transaction({
            id: "unknown",
            cause: "new_server_cause",
            type: 0,
            value: 40,
            exceed_bank_value: 40,
          }),
        ],
      },
    });
    const rows = wrapper.findAll("li");
    expect(rows[0].text()).toContain("Check-in recorded");
    const deducted = rows[0].get(".text-right > p");
    expect(deducted.text()).toBe("Deducted: 0d 1h 0m");
    expect(deducted.classes()).not.toContain("text-error");
    expect(deducted.classes()).not.toContain("text-success");
    expect(rows[0].get(".text-error").text()).toBe(
      "Excess incurred: 0d 0h 40m",
    );
    expect(rows[1].text()).toContain("Time off updated");
    expect(rows[1].findAll(".text-success").map((line) => line.text())).toEqual(
      ["Restored: 0d 1h 0m", "Excess cancelled: 0d 0h 20m"],
    );
    expect(rows[2].get(".text-right").text()).toBe("Deducted: 0d 1h 0m");
    expect(rows[2].find(".text-error, .text-success").exists()).toBe(false);
    expect(rows[2].text()).not.toContain("Excess");
    expect(rows[3].text()).toContain("PTO adjustment");
    expect(rows[3].get(".text-right > p").text()).toBe("Deducted: 0d 0h 0m");
    expect(rows[3].get(".text-error").text()).toBe(
      "Excess incurred: 0d 0h 40m",
    );
    expect(wrapper.text()).not.toContain("check_in_entries_create");
    expect(wrapper.text()).not.toContain("new_server_cause");
  });
});
