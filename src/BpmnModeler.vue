<template>
  <div ref="container">
    <el-container>
      <el-main>
        <div ref="canvas" class="canvas" />
        <ul class="buttons">
          <el-tooltip :content="$customTranslate('Undo')">
            <el-button icon="el-icon-back" @click="modeler.get('commandStack').undo()" />
          </el-tooltip>
          <el-tooltip :content="$customTranslate('Redo')">
            <el-button icon="el-icon-right" @click="modeler.get('commandStack').redo()" />
          </el-tooltip>
          <el-tooltip :content="$customTranslate('Fit Size')">
            <el-button icon="el-icon-rank" @click="fitViewport" />
          </el-tooltip>
          <el-tooltip :content="$customTranslate('Zoom Big')">
            <el-button icon="el-icon-zoom-in" @click="zoomViewport(true)" />
          </el-tooltip>
          <el-tooltip :content="$customTranslate('Zoom Small')">
            <el-button icon="el-icon-zoom-out" @click="zoomViewport(false)" />
          </el-tooltip>
          <el-tooltip :content="$customTranslate('Export as BPMN')">
            <el-button icon="el-icon-download" @click="exportBPMN(true)" />
          </el-tooltip>
          <el-tooltip :content="$customTranslate('Export as SVG')">
            <el-button icon="el-icon-picture" @click="exportSVG(true)" />
          </el-tooltip>
          <el-tooltip content="XML">
            <el-button icon="el-icon-document" @click="showXML" />
          </el-tooltip>
        </ul>
      </el-main>
      <el-aside>
        <properties-panel v-if="modeler" class="panel" :modeler="modeler" :element-templates="elementTemplates" />
      </el-aside>
    </el-container>
    <el-drawer :visible.sync="drawer" size="60%" direction="btt" :with-header="false">
      <el-input v-model="xml" type="textarea" autosize @input="openDiagram(xml)" />
    </el-drawer>
  </div>
</template>

<script>
import Modeler from 'bpmn-js/lib/Modeler'
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'
import miniMapModule from 'diagram-js-minimap'
import PropertiesPanel from './PropertiesPanel'
import { getTimeStr } from './utils/tools'
import { is } from 'bpmn-js/lib/util/ModelUtil'

export default {
  name: 'BpmnModeler',
  components: { PropertiesPanel },
  props: {
    source: {
      type: String,
      required: true
    },
    additionalModules: {
      type: Array,
      default: () => []
    },
    elementTemplates: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      modeler: null,
      element: null,
      xml: this.source,
      drawer: false,
      zoom: 1
    }
  },
  watch: {
    'xml'() {
      this.$emit('update', this.xml)
    }
  },
  mounted() {
    this.bindBpmn()
    this.registerFileDrop()
  },
  methods: {
    bindBpmn() {
      this.modeler = new Modeler({
        container: this.$refs.canvas,
        additionalModules: [
          miniMapModule,
          {
            translate: ['value', this.$customTranslate]
          },
          ...this.additionalModules
        ],
        moddleExtensions: {
          camunda: camundaModdleDescriptor
        },
        keyboard: {
          bindTo: document
        }
      })
      this.openDiagram(this.xml)
    },
    async openDiagram(xml) {
      try {
        const
          result = await this.modeler.importXML(xml),
          { warnings } = result
        this.modeler.get('canvas').zoom('fit-viewport')
        if (warnings.length > 0) {
          this.$message.warning(warnings)
        }
      } catch (err) {
        this.$message.error(err.message + err.warnings)
      }
    },
    async exportSVG(download = false) {
      try {
        const { svg } = await this.modeler.saveSVG({ format: true })
        if (download) {
          this.downloadFile(this.getExportFileName(), svg, 'image/svg+xml')
        }
        return svg
      } catch (err) {
        this.$message.error(err)
      }
    },
    async exportBPMN(download = false) {
      try {
        const { xml } = await this.modeler.saveXML({ format: true })
        if (download) {
          this.downloadFile(`${this.getExportFileName()}.bpmn`, xml, 'application/xml')
        }
        this.xml = xml
        return xml
      } catch (err) {
        this.$message.error(err)
      }
    },
    downloadFile(filename, data, type) {
      const
        a = document.createElement('a'),
        url = window.URL.createObjectURL(new Blob([data], { type: type }))
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    },
    getExportFileName() {
      const processElement = this.getProcessElement()
      return (processElement.name || processElement.id || 'undefined') + '-' + getTimeStr()
    },
    getProcessElement() {
      const rootElements = this.modeler.getDefinitions().rootElements
      for (let i = 0; i < rootElements.length; i++) {
        if (is(rootElements[i], 'bpmn:Process')) return rootElements[i]
      }
    },
    async showXML() {
      await this.exportBPMN()
      this.drawer = true
    },
    registerFileDrop() {
      this.$refs.container.ondragover = e => {
        e.stopPropagation()
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy' // Explicitly show this is a copy.
      }
      this.$refs.container.ondrop = (e) => {
        e.stopPropagation()
        e.preventDefault()
        const
          files = e.dataTransfer.files,
          file = files[0],
          reader = new FileReader()
        reader.onload = (e) => {
          this.openDiagram(e.target.result)
        }
        reader.readAsText(file)
      }
    },
    fitViewport() {
      this.zoom = this.modeler.get('canvas').zoom('fit-viewport')
      const
        bbox = document.querySelector('.canvas .viewport').getBBox(),
        currentViewbox = this.modeler.get('canvas').viewbox(),
        elementMid = {
          x: bbox.x + bbox.width / 2 - 65,
          y: bbox.y + bbox.height / 2
        }
      this.modeler.get('canvas').viewbox({
        x: elementMid.x - currentViewbox.width / 2,
        y: elementMid.y - currentViewbox.height / 2,
        width: currentViewbox.width,
        height: currentViewbox.height
      })
      this.zoom = bbox.width / currentViewbox.width * 1.8
    },
    zoomViewport(zoomIn = true) {
      this.zoom = this.modeler.get('canvas').zoom()
      this.zoom += (zoomIn ? 0.1 : -0.1)
      this.modeler.get('canvas').zoom(this.zoom)
      this.$message.info(Number(this.zoom * 100).toFixed(0) + '%')
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
@import "./styles/bpmn.scss";
</style>
