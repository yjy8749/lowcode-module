import { DesignerEditor } from '../../../../designer-editor.type'
import PageEventDefine from '../../../PageEventDefine.vue'

export default defineComponent({
  label: '自定义事件',
  order: 1,
  props: {
    editor: {
      type: Object as PropType<DesignerEditor>,
      required: true
    }
  },
  setup(props) {
    return () => (
      <>
        <PageEventDefine editor={props.editor} />
      </>
    )
  }
})
