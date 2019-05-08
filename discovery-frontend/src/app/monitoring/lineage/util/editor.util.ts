/**
 * 에디터에서 쓰이 관련 유틸
 */
export class EditorUtil {

    public static isEmpty(obj : any) {
        if (obj == null) return true;
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;
        if (typeof obj !== "object") return true;
        return true;
    }
}