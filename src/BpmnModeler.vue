<!-- 仅展示如何使用和集成，请根据需要拷贝本页面的代码 -->
<template>
  <div ref="container">
    <el-container>
      <el-main>
        <div ref="canvas" class="modelering" />
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
import PropertiesPanel from './views/PropertiesPanel'
import CUSTOM_ELEMENT_TEMPLATES from './custom.json'
import { INITIAL_DIAGRAM } from './utils/constants'
import { getProcessElement } from './utils'
import { next } from './utils/tools'

export default {
  name: 'BpmnModeler',
  components: { PropertiesPanel },
  data() {
    return {
      modeler: null,
      element: null,
      xml: INITIAL_DIAGRAM,
      drawer: false,
      zoom: 1,
      elementTemplates: CUSTOM_ELEMENT_TEMPLATES
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
          }
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
        if (warnings.length) {
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
        return (this.xml = xml)
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
      const processElement = getProcessElement(this.modeler)
      return next((processElement.name || processElement.id))
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
        bbox = document.querySelector('.modelering .viewport').getBBox(),
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

  .modelering {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .panel {
    position: absolute;
    top: 5px;
    bottom: 5px;
    right: 5px;
    min-width: 300px;
    border-left: 1px solid #ccc;
    overflow: auto;
    background-color: #F2F6FC;
    .el-badge__content.is-fixed {
      top: 15px;
    }
  }

  .djs-palette {
    left: 1px;
    top: 5px;
  }

  .buttons {
    position: absolute;
    left: 110px;
    bottom: 5px;
  }
</style>
