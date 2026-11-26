package expo.modules.offgridcomposereditor

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import org.json.JSONObject
import org.json.JSONArray

internal object OffgridComposerClipboard {
  // Pasted thread links become chips in JS; packages/shared/src/threadLinks.ts parses them.
  fun hasThreadLink(text: String): Boolean =
    text.contains("offgrid-thread://v2/") || text.contains("https://app.t3.codes/threads/") || text.contains("offgrid://threads/")

  fun write(context: Context, text: String, fragment: String) {
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    val payload = try {
      JSONObject(fragment)
    } catch (_: Exception) {
      null
    }
    val records = payload?.optJSONArray("records")
    if (payload == null || records == null) {
      clipboard.setPrimaryClip(ClipData.newPlainText("Offgrid", text))
      return
    }
    val all = (0 until records.length()).map { records.getJSONObject(it) }
    val selected = all.filter { text.contains("/${it.optString("contextId")})") }.toMutableList()
    val screenshots = selected.map { it.optString("screenshotContextId") }.toSet()
    selected.addAll(
      all.filter {
        screenshots.contains(it.optString("contextId")) &&
          !selected.contains(it)
      }
    )
    payload.put("records", JSONArray(selected))
    val encoded = java.net.URLEncoder.encode(payload.toString(), "UTF-8").replace("+", "%20")
    val escaped = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    clipboard.setPrimaryClip(
      if (selected.isEmpty()) {
        ClipData.newPlainText(
          "Offgrid",
          text
        )
      } else {
        ClipData.newHtmlText(
          "Offgrid",
          text,
          "<pre data-offgrid-context-fragment=\"$encoded\">$escaped</pre>"
        )
      }
    )
  }

  fun read(context: Context): Map<String, String> {
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    val clip = clipboard.primaryClip
    val item = if (clip != null && clip.itemCount > 0) clip.getItemAt(0) else null
    return mapOf(
      "text" to (item?.text?.toString() ?: ""),
      "html" to (item?.htmlText ?: ""),
      "fragment" to ""
    )
  }
}

class OffgridComposerEditorModule : Module() {
  @Suppress("LongMethod") // A flat list of the view's props and events.
  override fun definition() = ModuleDefinition {
    Name("OffgridComposerEditor")

    AsyncFunction("writeContextClipboard") { text: String, fragment: String ->
      OffgridComposerClipboard.write(requireNotNull(appContext.reactContext), text, fragment)
    }

    View(OffgridComposerEditorView::class) {
      Prop("controlledDocumentJson") { view: OffgridComposerEditorView, documentJson: String ->
        view.setControlledDocumentJson(documentJson)
      }
      Prop("themeJson") { view: OffgridComposerEditorView, themeJson: String ->
        view.setThemeJson(themeJson)
      }
      Prop("clipboardFragment") { view: OffgridComposerEditorView, fragment: String ->
        view.setClipboardFragment(fragment)
      }
      Prop("placeholder") { view: OffgridComposerEditorView, placeholder: String ->
        view.setPlaceholder(placeholder)
      }
      Prop("fontFamily") { view: OffgridComposerEditorView, fontFamily: String ->
        view.setFontFamily(fontFamily)
      }
      Prop("fontSize") { view: OffgridComposerEditorView, fontSize: Double ->
        view.setFontSize(fontSize.toFloat())
      }
      Prop("lineHeight") { view: OffgridComposerEditorView, lineHeight: Double ->
        view.setLineHeight(lineHeight.toFloat())
      }
      Prop("contentInsetVertical") { view: OffgridComposerEditorView, contentInsetVertical: Double ->
        view.setContentInsetVertical(contentInsetVertical.toInt())
      }

      Prop("singleLineCentered") { view: OffgridComposerEditorView, singleLineCentered: Boolean ->
        view.setSingleLineCentered(singleLineCentered)
      }
      Prop("editable") { view: OffgridComposerEditorView, editable: Boolean ->
        view.setEditable(editable)
      }
      Prop("readOnly") { view: OffgridComposerEditorView, readOnly: Boolean ->
        view.setReadOnly(readOnly)
      }
      Prop("enterBehavior") { view: OffgridComposerEditorView, behavior: String ->
        view.setEnterBehavior(behavior)
      }
      Prop("submitEnabled") { view: OffgridComposerEditorView, enabled: Boolean ->
        view.setSubmitEnabled(enabled)
      }
      Prop("scrollEnabled") { view: OffgridComposerEditorView, scrollEnabled: Boolean ->
        view.setScrollEnabled(scrollEnabled)
      }
      Prop("autoFocus") { view: OffgridComposerEditorView, autoFocus: Boolean ->
        view.setAutoFocus(autoFocus)
      }
      Prop("autoCorrect") { view: OffgridComposerEditorView, autoCorrect: Boolean ->
        view.setAutoCorrect(autoCorrect)
      }
      Prop("spellCheck") { view: OffgridComposerEditorView, spellCheck: Boolean ->
        view.setSpellCheck(spellCheck)
      }
      Prop("textPasteThresholdBytes") { view: OffgridComposerEditorView, threshold: Int ->
        view.setTextPasteThresholdBytes(threshold)
      }
      Prop("maxInputChars") { view: OffgridComposerEditorView, maxInputChars: Int ->
        view.setMaxInputChars(maxInputChars)
      }

      Events(
        "onComposerChange",
        "onComposerSelectionChange",
        "onComposerFocus",
        "onComposerBlur",
        "onComposerSubmit",
        "onComposerPasteImages",
        "onComposerContextPress",
        "onComposerPasteContext",
        "onComposerPasteText",
        "onComposerContentSizeChange",
      )

      AsyncFunction("focus") { view: OffgridComposerEditorView ->
        view.focusEditor()
      }
      AsyncFunction("blur") { view: OffgridComposerEditorView ->
        view.blurEditor()
      }
      AsyncFunction("setSelection") { view: OffgridComposerEditorView, start: Int, end: Int ->
        view.setSelection(start, end)
      }
    }
  }
}
