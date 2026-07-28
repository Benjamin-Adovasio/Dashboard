(() => {
  "use strict";

  const form = document.getElementById("contact-form");

  if (!form) {
    return;
  }

  const note = document.getElementById("form-note");
  const phone = document.getElementById("contact-phone");
  const preference = document.getElementById("contact-preference");
  const defaultNote = note?.textContent.trim() || "";

  preselectCustomerType();

  preference?.addEventListener("change", validatePhonePreference);
  phone?.addEventListener("input", validatePhonePreference);

  form.addEventListener("input", () => {
    if (note && note.dataset.state === "validation") {
      note.textContent = defaultNote;
      delete note.dataset.state;
    }
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    validatePhonePreference();

    if (!form.checkValidity()) {
      if (note) {
        note.textContent = "Check the highlighted fields before continuing.";
        note.dataset.state = "validation";
      }

      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const customerType = clean(data.get("customerType"));
    const preferredContact = clean(data.get("preferredContact"));
    const subject = `${customerType} inquiry — ${clean(data.get("name"))}`;
    const body = [
      `Name: ${clean(data.get("name"))}`,
      `Email: ${clean(data.get("email"))}`,
      `Phone: ${clean(data.get("phone")) || "Not provided"}`,
      `Customer path: ${customerType}`,
      `Preferred contact: ${preferredContact || "No preference"}`,
      "",
      "What can we help with?",
      clean(data.get("message")),
      "",
      "Prepared from adovasio.com/contact.html"
    ].join("\r\n");

    if (note) {
      note.textContent =
        "Opening your email app. Nothing has been sent yet—review the message, then send it.";
      note.dataset.state = "handoff";
    }

    window.location.href =
      `mailto:info@adovasio.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  function preselectCustomerType() {
    const params = new URLSearchParams(window.location.search);
    const customerType = normalizeCustomerType(params.get("type")) ||
      normalizeCustomerType(params.get("path"));

    if (!customerType) {
      return;
    }

    const input = form.querySelector(
      `input[name="customerType"][value="${customerType}"]`
    );

    if (input) {
      input.checked = true;
    }
  }

  function normalizeCustomerType(value) {
    const normalized = clean(value)
      .toLowerCase()
      .replace(/^\/+|\/+$/g, "");

    if (normalized === "business" || normalized === "biz") {
      return "Business";
    }

    if (normalized === "residential" || normalized === "home") {
      return "Residential";
    }

    return "";
  }

  function validatePhonePreference() {
    if (!phone || !preference) {
      return;
    }

    phone.setCustomValidity(
      preference.value === "Phone" && !phone.value.trim()
        ? "Add a phone number if you prefer a phone call."
        : ""
    );
  }

  function clean(value) {
    return String(value || "").trim();
  }
})();
