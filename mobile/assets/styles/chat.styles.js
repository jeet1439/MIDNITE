import { StyleSheet } from "react-native";
import COLORS from "../constants/colors.js";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  subtitle: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.border,
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textDark,
    flex: 1,
  },
  preview: {
    marginTop: 6,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  muted: {
    color: COLORS.textSecondary,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
    marginTop: 16,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  threadHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  threadMessages: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 10,
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMine: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.cardBackground,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleTextMine: {
    color: COLORS.white,
    fontSize: 15,
  },
  bubbleTextOther: {
    color: COLORS.textDark,
    fontSize: 15,
  },
  metaMine: {
    color: "#d7e8fb",
    fontSize: 11,
    marginTop: 6,
  },
  metaOther: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 6,
  },
  composer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
});

export default styles;
