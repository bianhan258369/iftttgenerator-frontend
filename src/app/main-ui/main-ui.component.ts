import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpEventType, HttpResponse } from "@angular/common/http";
import { GenerateService } from '../service/generate.service';
import { UploadService } from '../service/upload.service';
import * as joint from 'node_modules/jointjs/dist/joint.js';
import { Rect } from '../entity/Rect';
import { Oval } from '../entity/Oval';
import { Line } from '../entity/Line';
import { Phenomenon } from '../entity/Phenomenon';
import { PFService } from '../service/pf.service';
import { SimulationService } from '../service/simulation.service';
import { IfThenRequirement } from '../entity/IfThenRequirement';


@Component({
	selector: 'app-main-ui',
	templateUrl: './main-ui.component.html',
	styleUrls: ['./main-ui.component.css']
})
export class MainUIComponent implements OnInit {
	interval
	index: number;
	tabs: Array<string>;
	srImgURL: string;
	drImgURL: string;
	sbImgURL: string;
	requirementTexts: string;
	complementedRequirements: string;
	reverseRequirements: string;
	functionalRequirements: string;
	solvableErrors: Array<string>;
	unsolvableErrors: Array<string>;
	ruleErrorFlag: boolean;
	formalismErrorFlag: boolean;
	problemDiagramFlag: boolean;
	rules: Array<string>;
	instructions: Array<string>;
	ontologyFilePath: string;
	graph: joint.dia.Graph;
	paper: joint.dia.Paper;
	rects: Array<Rect>;
	ovals: Array<Oval>;
	lines: Array<Line>;
	rectsWithSensors: Array<Rect>;
	linesWithSensors: Array<Line>;
	phenomena: Array<Phenomenon>
	referencePhenomena: Array<Phenomenon>;
	ifThenRequirements: Array<IfThenRequirement>;
	srSCDPath: string;
	drSCDPath: string;
	sbSCDPath: string;
	languageId = "req";
	editorOptions = { theme: "reqTheme", language: "req", minimap: { enabled: false }, automaticLayout: true };
	// editorOptions = { theme: "reqTheme", language: "req", minimap: { enabled: false },showUnused: false};
	editor;

	constructor(private generateService: GenerateService, private uploadService: UploadService, private pfService: PFService, private simulationService: SimulationService) { }

	ngOnInit() {
		this.tabs = new Array<string>("requirements", "devicerequirements", "problemdiagram", "systembehaviours", "instructions")
		this.rules = new Array<string>();
		this.solvableErrors = new Array<string>();
		this.unsolvableErrors = new Array<string>();
		this.rects = new Array<Rect>();
		this.ovals = new Array<Oval>();
		this.lines = new Array<Line>();
		this.rectsWithSensors = new Array<Rect>();
		this.linesWithSensors = new Array<Line>();
		this.phenomena = new Array<Phenomenon>()
		this.referencePhenomena = new Array<Phenomenon>();
		this.problemDiagramFlag = false;
		this.ifThenRequirements = new Array<IfThenRequirement>()
		this.initPaper();
		this.change_Menu('requirements')
	}

	open2 = true;
	setOpen2(): void {
		this.open2 = !this.open2;
	}
	// open3 = true;
	// setOpen3(): void {
	// 	this.open3 = !this.open3;
	// }
	open4 = true;
	setOpen4(): void {
		this.open4 = !this.open4;
	}
	open5 = true;
	setOpen5(): void {
		this.open5 = !this.open5;
	}

	showProblemDiagram(rects, ovals, lines) {
		this.graph.clear();
		var MachineElement = joint.dia.Element.define('examples.CustomTextElement', {
			attrs: {
				label: {
					textAnchor: 'middle', //文本居中
					textVerticalAnchor: 'middle',
				},
				r: {
					strokeWidth: 1, //宽度
					stroke: '#000000', //颜色
					fill: 'none' //填充色
				},
				r1: {
					strokeWidth: 1,
					stroke: '#000000',
					fill: 'none',
				},
				r2: {
					strokeWidth: 1,
					stroke: '#000000',
					fill: 'none',
				},
			}
		}, {
			markup: [{
				tagName: 'text',
				selector: 'label'
			}, {
				tagName: 'rect',
				selector: 'r'
			}, {
				tagName: 'rect',
				selector: 'r1'
			}, {
				tagName: 'rect',
				selector: 'r2'
			}]
		});

		var machineElement = new MachineElement();
		let rectGraphList = new Array<joint.shapes.basic.Rect>();
		let ovalGraphList = new Array<joint.shapes.basic.Ellipse>();
		for (let i = 0; i < rects.length; i++) {
			let rect = new joint.shapes.standard.Rectangle({
				position: { x: rects[i].x1, y: rects[i].y1 },
				size: { width: rects[i].x2 + 150, height: rects[i].y2 },
				attrs: { body: { stroke: '#000000', fill: 'none', strokeWidth: 1 }, label: { text: rects[i].text.replace("&#x000A", '\n'), fill: '#000000' } }
			});
			rectGraphList[i] = rect;
			if (rects[i].state === 2) {
				machineElement.attr(
					{
						label: {
							text: rects[i].text.replace("&#x000A", '\n') + '(' + rects[i].shortName + ')',
							x: rects[i].x1,
							y: rects[i].y1,
						},
						r: {
							ref: 'label',
							refX: -45, //坐标原点
							refY: 0,
							x: 0, //图形位置
							y: 0,
							refWidth: 60, //图形大小
							refHeight: '150%',
						},
						r1: {
							ref: 'r',
							refX: 20,
							refY: 0,
							x: 0,
							y: 0,
							refWidth: -20,
							refHeight: '100%'
						},
						r2: {
							ref: 'r',
							refX: 40,
							refY: 0,
							x: 0,
							y: 0,
							refWidth: -40,
							refHeight: '100%',
						},
						root: {
							title: 'machine:' + rects[i].text,
						}
					});
			}
		}
		for (let i = 0; i < ovals.length; i++) {
			let oval = new joint.shapes.standard.Ellipse({
				position: { x: ovals[i].x1, y: ovals[i].y1 },
				size: { width: ovals[i].x2 + 150, height: ovals[i].y2 },
				attrs: { body: { fill: 'none', strokeWidth: 1, strokeDasharray: '10,5' }, label: { text: ovals[i].text, fill: '#000000' } }
			});
			ovalGraphList[i] = oval;
		}
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			if (line.state === 0) {
				let rectTo: Rect = line.to as Rect;
				let rectToIndex = -1;
				for (let j = 0; j < rects.length; j++) {
					let tempRect: Rect = rects[j];
					if (tempRect.text.replace("&#x000A", '\n') === rectTo.text.replace("&#x000A", '\n')) rectToIndex = j;
				}
				let link = new joint.shapes.standard.Link({
					source: { id: machineElement.id },
					target: { id: rectGraphList[rectToIndex].id },
				});
				link.appendLabel({
					attrs: {
						text: {
							text: line.name,
						},
						body: {
							stroke: 'transparent',
							fill: 'transparent'
						}
					}
				});
				link.attr({
					line: {
						strokeWidth: 1,
						targetMarker: {
							'fill': 'none',
							'stroke': 'none',
						}
					},

				});
				this.graph.addCells([rectGraphList[rectToIndex], machineElement, link]);
			}
			else if (line.state === 1) {
				let oval: Oval = line.from as Oval;
				let rect: Rect = line.to as Rect;
				let rectIndex = -1;
				let ovalIndex = -1;
				for (let j = 0; j < rects.length; j++) {
					let tempRect: Rect = rects[j];
					if (tempRect.text.replace("&#x000A", '\n') === rect.text.replace("&#x000A", '\n')) rectIndex = j;
				}
				for (let j = 0; j < ovals.length; j++) {
					let tempOval: Oval = ovals[j];
					if (tempOval.text === oval.text) ovalIndex = j;
				}
				let link = new joint.shapes.standard.Link({
					source: { id: rectGraphList[rectIndex].id },
					target: { id: ovalGraphList[ovalIndex].id },
				});
				link.appendLabel({
					attrs: {
						text: {
							text: line.name,
						},
						body: {
							stroke: 'transparent',
							fill: 'transparent'
						}
					}
				});
				link.attr({
					line: {
						strokeWidth: 1,
						targetMarker: {
							'fill': 'none',
							'stroke': 'none',
						},
						strokeDasharray: '8,4',
					},

				});
				this.graph.addCells([rectGraphList[rectIndex], ovalGraphList[ovalIndex], link]);
			}
			else if (line.state === 2) {
				let oval: Oval = line.from as Oval;
				let rect: Rect = line.to as Rect;
				let rectIndex = -1;
				let ovalIndex = -1;
				for (let j = 0; j < rects.length; j++) {
					let tempRect: Rect = rects[j];
					if (tempRect.text.replace("&#x000A", '\n') === rect.text.replace("&#x000A", '\n')) rectIndex = j;
				}
				for (let j = 0; j < ovals.length; j++) {
					let tempOval: Oval = ovals[j];
					if (tempOval.text === oval.text) ovalIndex = j;
				}
				let link = new joint.shapes.standard.Link({
					source: { id: ovalGraphList[ovalIndex].id },
					target: { id: rectGraphList[rectIndex].id },
					attrs: {
						line: {
							strokeDasharray: '5 5'
						}
					}
				});
				link.appendLabel({
					attrs: {
						text: {
							text: line.name,
						},
						body: {
							stroke: 'transparent',
							fill: 'transparent'
						}
					}
				});
				link.attr({
					line: {
						strokeWidth: 1,
						targetMarker: {
							'fill': 'black',
							'stroke': 'black',
						},
						strokeDasharray: '8,4',
					},

				});
				this.graph.addCells([rectGraphList[rectIndex], ovalGraphList[ovalIndex], link]);
			}
			else {
				let rectFrom: Rect = line.from as Rect;
				let rectTo: Rect = line.to as Rect;
				let rectFromIndex = -1;
				let rectToIndex = -1;
				for (let j = 0; j < rects.length; j++) {
					let tempRect: Rect = rects[j];
					if (tempRect.text.replace("&#x000A", '\n') === rectFrom.text.replace("&#x000A", '\n')) rectFromIndex = j;
				}
				for (let j = 0; j < rects.length; j++) {
					let tempRect: Rect = rects[j];
					if (tempRect.text.replace("&#x000A", '\n') === rectTo.text.replace("&#x000A", '\n')) rectToIndex = j;
				}
				let link = new joint.shapes.standard.Link({
					source: { id: rectGraphList[rectFromIndex].id },
					target: { id: rectGraphList[rectToIndex].id },
				});
				link.appendLabel({
					attrs: {
						text: {
							text: line.name,
						},
						body: {
							stroke: 'transparent',
							fill: 'transparent'
						}
					}
				});
				link.attr({
					line: {
						strokeWidth: 1,
						targetMarker: {
							'fill': 'none',
							'stroke': 'none',
						}
					},

				});
				this.graph.addCells([rectGraphList[rectFromIndex], rectGraphList[rectToIndex], link]);
			}
		}
	}

	initPaper(): void {
		this.graph = new joint.dia.Graph();
		let d = $("#content");
		let wid = d.width();
		let hei = d.height();
		this.paper = new joint.dia.Paper({
			el: $("#content"),
			width: wid,
			height: hei,
			model: this.graph,
			gridSize: 10,
			drawGrid: true,
			background: {
				color: 'rgb(240,255,255)'
			}
		});
		this.paper.scale(0.8, 0.5);
		var that = this;
		this.paper.on('blank:mousewheel', (event, x, y, delta) => {
			let scale = that.paper.scale();
			that.paper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
		});
	}

	selectedFileOnChanged(event) {
		this.uploadFile(event.target.files[0])
	}

	uploadFile(file: File) {
		this.uploadService.uploadFile(file).subscribe(event => {
			if (event.type == HttpEventType.UploadProgress) {
				const percentDone = Math.round(100 * event.loaded / event.total);
				console.log(`File is ${percentDone}% loaded.`);
			} else if (event instanceof HttpResponse) {
				console.log(event.body.filePath)
				this.ontologyFilePath = event.body.filePath;
			}
		},
			(err) => {
				console.log("Upload Error:", err);
			}, () => {
				console.log("Upload done");
			}
		)
	}

	change_Menu(tab: string) {
		for (var i = 0; i < this.tabs.length; i++) {
			if (tab === this.tabs[i]) {
				document.getElementById(tab + 'Panel').style.display = 'block';
				document.getElementById(tab).style.display = 'inline-block';
				document.getElementById(tab).style.background = '#166dac'
				if (tab === 'problemdiagram') document.getElementById('content').style.display = 'block';
				else document.getElementById('content').style.display = 'none';
			}
			else {
				document.getElementById(this.tabs[i] + 'Panel').style.display = 'none';
				document.getElementById(this.tabs[i]).style.background = '#62a0cc'
			}
		}
	}

	change_Error_Menu(tab: string) {
		if (tab == 'solvable') {
			document.getElementById('solvableErrorsPanel').style.display = 'block';
			document.getElementById('unsolvableErrorsPanel').style.display = 'none';
			document.getElementById('solvableErrorsTab').style.background = '#166dac'
			document.getElementById('unsolvableErrorsTab').style.background = '#62a0cc'
		}
		else if (tab == 'unsolvable') {
			document.getElementById('solvableErrorsPanel').style.display = 'none';
			document.getElementById('unsolvableErrorsPanel').style.display = 'block';
			document.getElementById('unsolvableErrorsTab').style.background = '#166dac'
			document.getElementById('solvableErrorsTab').style.background = '#62a0cc'
		}
	}

	chooseScenario() {
		var scenario = $("input[name=scenarioRadio]:checked").val();
		this.generateService.chooseScenario(scenario.toString()).subscribe(result => {
			this.ontologyFilePath = result.path
			this.cancel()
		})
	}

	complementRequirements() {
		var planing = $("input[name=planingRadio]:checked").val();
		if (planing === 'Random') this.index = 0;
		if (planing === 'SaveEnergy') this.index = 1;
		var requirements: string = ''
		for (var i = 0; i < this.requirementTexts.split('\n').length; i++) {
			var requirement: string = this.requirementTexts.split('\n')[i];
			if (requirement.trim() !== '') {
				requirements = requirements + requirement;
				if (i !== this.requirementTexts.split('\n').length - 1) requirements = requirements + '//'
			}
		}
		this.generateService.getComplementedRequirements(this.ontologyFilePath).subscribe(result => {
			this.complementedRequirements = result.complementedRequirements;
			var allRequirements: string = this.complementedRequirements.trim().length != 0 ? requirements + "//" : requirements;
			for (var i = 0; i < this.complementedRequirements.split('\n').length; i++) {
				var requirement: string = this.complementedRequirements.split('\n')[i];
				if (requirement.trim() != '') {
					allRequirements = allRequirements + requirement;
					if (i != this.complementedRequirements.split('\n').length - 1) allRequirements = allRequirements + '//'
				}
			}
			document.getElementById("planing").style.display = 'none';
			this.pfService.getSrSCD(allRequirements, this.ontologyFilePath).subscribe(result2 => {
				this.srSCDPath = result2.srPath;
				this.showSrSCD();
			})
		})
	}

	generateFunctionalRequirements() {
		var planing = $("input[name=planingRadio]:checked").val();
		if (planing === 'Random') this.index = 0;
		if (planing === 'SaveEnergy') this.index = 1;
		if (planing === 'BestPerformance') this.index = 2;
		var requirements: string = ''
		for (var i = 0; i < this.requirementTexts.split('\n').length; i++) {
			var requirement: string = this.requirementTexts.split('\n')[i];
			if (requirement.trim() !== '') {
				requirements = requirements + requirement;
				if (i !== this.requirementTexts.split('\n').length - 1) requirements = requirements + '//'
			}
		}
		this.generateService.getReverseRequirements(requirements, this.ontologyFilePath, this.index).subscribe(result => {
			this.reverseRequirements = result.reverseRequirements;
			document.getElementById("planing").style.display = 'none';
			var requirements = this.requirementTexts + '\n' + this.reverseRequirements;
			// var requirements = this.requirementTexts + '\n' + this.reverseRequirements + '\n' + this.complementedRequirements;
			var allRequirements: string = ''
			for (var i = 0; i < requirements.split('\n').length; i++) {
				var requirement: string = requirements.split('\n')[i];
				if (requirement.trim() !== '') {
					allRequirements = allRequirements + requirement;
					if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
				}
			}
			var tempComplementedRequirements: string = ''
			for (var i = 0; i < this.complementedRequirements.split('\n').length; i++) {
				var tempRequirement: string = this.complementedRequirements.split('\n')[i];
				if (tempRequirement.trim() !== '') {
					tempComplementedRequirements = tempComplementedRequirements + tempRequirement;
					if (i !== this.complementedRequirements.split('\n').length - 1) tempComplementedRequirements = tempComplementedRequirements + '//'
				}
			}
			this.generateService.generateFunctionalRequirements(allRequirements, this.ontologyFilePath, this.index, tempComplementedRequirements).subscribe(result2 => {
				// this.functionalRequirements = result2.functionalRequirements.concat(this.complementedRequirements.split("\n"));
				this.functionalRequirements = result2.functionalRequirements.join('\n') + "\n" + this.complementedRequirements;
				this.ifThenRequirements = result2.ifThenRequirements;
				var triggerLists: Array<Array<string>>
				var actionLists: Array<Array<string>>
				var times: Array<string>
				var expectations: Array<string>
				triggerLists = new Array<Array<string>>()
				actionLists = new Array<Array<string>>()
				times = new Array<string>()
				expectations = new Array<string>()
				for (var i = 0; i < this.ifThenRequirements.length; i++) {
					var ifThenRequirement = this.ifThenRequirements[i]
					triggerLists.push(ifThenRequirement.triggerList)
					actionLists.push(ifThenRequirement.actionList)
					times.push(ifThenRequirement.time)
					expectations.push(ifThenRequirement.expectation)
				}
				this.change_Menu("devicerequirements")
				var allRequirements = this.functionalRequirements.split('\n').join("//")
				this.solvableErrors.length = 0
				this.unsolvableErrors.length = 0
				this.generateService.check(allRequirements, this.ontologyFilePath, this.index).subscribe(result3 => {
					this.solvableErrors = result3.solvableErrors
					this.unsolvableErrors = result3.unsolvableErrors
					this.change_Error_Menu('solvable');
					this.pfService.getDrSCD(triggerLists, actionLists, times, expectations, this.ontologyFilePath).subscribe(result4 => {
						this.drSCDPath = result4.drPath;
						this.showDrSCD()
						this.closeDetails();
					})
				})
			})
		})
	}

	checkErrors() {
		var allRequirements = this.functionalRequirements.split('\n').join("//")
		this.solvableErrors.length = 0
		this.unsolvableErrors.length = 0
		this.generateService.check(allRequirements, this.ontologyFilePath, this.index).subscribe(result => {
			this.solvableErrors = result.solvableErrors
			this.unsolvableErrors = result.unsolvableErrors
		})
	}

	solve() {
		if (this.solvableErrors.length == 1 && this.solvableErrors[0] == "No Solvable Errors") alert("No Solvable Errors To Be Solved!")
		else {
			var triggerLists: Array<Array<string>>
			var actionLists: Array<Array<string>>
			var times: Array<string>
			var expectations: Array<string>
			triggerLists = new Array<Array<string>>()
			actionLists = new Array<Array<string>>()
			times = new Array<string>()
			expectations = new Array<string>()
			for (var i = 0; i < this.ifThenRequirements.length; i++) {
				var ifThenRequirement = this.ifThenRequirements[i]
				triggerLists.push(ifThenRequirement.triggerList)
				actionLists.push(ifThenRequirement.actionList)
				times.push(ifThenRequirement.time)
				expectations.push(ifThenRequirement.expectation)
			}
			this.generateService.solve(triggerLists, actionLists, times, expectations).subscribe(result => {
				if (result.solved == null) {
					alert("Cannot Be Sloved!")
				}
				else {
					var tempFunctionalRequiremts: string = ''
					console.log(result.solved)
					for (var i = 0; i < result.solved.length; i++) {
						if (i != result.solved.length - 1) tempFunctionalRequiremts = tempFunctionalRequiremts + result.solved[i] + "\n";
						else tempFunctionalRequiremts = tempFunctionalRequiremts + result.solved[i];
					}
					this.functionalRequirements = tempFunctionalRequiremts;
					this.solvableErrors.length = 0
					this.solvableErrors.push("No Solvable Errors")

					triggerLists = new Array<Array<string>>()
					actionLists = new Array<Array<string>>()
					times = new Array<string>()
					expectations = new Array<string>()
					this.ifThenRequirements = result.ifThenRequirements
					for (var i = 0; i < this.ifThenRequirements.length; i++) {
						var ifThenRequirement = this.ifThenRequirements[i]
						triggerLists.push(ifThenRequirement.triggerList)
						actionLists.push(ifThenRequirement.actionList)
						times.push(ifThenRequirement.time)
						expectations.push(ifThenRequirement.expectation)
					}
					this.pfService.getDrSCD(triggerLists, actionLists, times, expectations, this.ontologyFilePath).subscribe(result2 => {
						this.drSCDPath = result2.drPath;
						this.showDrSCD()
						this.closeDetails();
					})
				}
			})
		}
	}

	displayPlaningPanel() {
		document.getElementById("planing").style.display = 'block';
	}

	displayChooseScenarioPanel() {
		document.getElementById("chooseScenario").style.display = 'block';
	}

	// problemDiagramDerivation() {
	// 	var allRequirements = this.functionalRequirements.join("//")
	// 	this.pfService.getProblemDiagram(allRequirements, this.ontologyFilePath, this.index).subscribe(result => {
	// 		this.generateService.check(allRequirements, this.ontologyFilePath, this.index).subscribe(result2 => {
	// 			this.errors = result2
	// 			this.phenomena = result.phenomena;
	// 			this.referencePhenomena = result.referencePhenomena
	// 			this.ovals = result.ovals
	// 			this.rects = result.rectsWithoutSensors
	// 			this.lines = result.linesWithoutSensors
	// 			document.getElementById("problemdiagram").style.display = 'block';
	// 			this.change_Menu("problemdiagram")
	// 			this.showProblemDiagram(this.rects, this.ovals, this.lines)
	// 			this.problemDiagramFlag = true;
	// 			this.closeDetails();
	// 		})
	// 	})
	// }

	// problemDiagramDerivation2() {
	// 	var allRequirements = this.functionalRequirements.join("//")
	// 	this.errors.length = 0
	// 	this.errors.push('No Errors!')
	// 	this.pfService.getProblemDiagram(allRequirements, this.ontologyFilePath, this.index).subscribe(result => {
	// 		this.generateService.check(allRequirements, this.ontologyFilePath, this.index).subscribe(result2 => {
	// 			this.errors = result2;
	// 			this.phenomena = result.phenomena;
	// 			this.referencePhenomena = result.referencePhenomena
	// 			this.ovals = result.ovals
	// 			this.rects = result.rectsWithSensors
	// 			this.lines = result.linesWithSensors
	// 			this.rectsWithSensors = result.rectsWithSensors
	// 			this.linesWithSensors = result.linesWithSensors
	// 			document.getElementById("problemdiagram").style.display = 'block';
	// 			this.change_Menu("problemdiagram")
	// 			this.showProblemDiagram(this.rectsWithSensors, this.ovals, this.linesWithSensors)
	// 			this.problemDiagramFlag = true;
	// 			this.closeDetails();
	// 		})
	// 	})
	// }

	// formalismBasedCheck() {
	// 	if (!this.ruleErrorFlag) {
	// 		alert('Please Solve The Rule Errors First!')
	// 		this.closeDetails();
	// 	}
	// 	else {
	// 		this.errors.length = 0;
	// 		var allRequirements = this.functionalRequirements.join("//")
	// 		this.generateService.z3Check(allRequirements, this.ontologyFilePath, this.index).subscribe(result => {
	// 			console.log(result)
	// 			if (result.sat === 'sat') {
	// 				this.errors.length = 0
	// 				this.errors.push('No Formalism Errors!');
	// 				this.formalismErrorFlag = true;
	// 			}
	// 			else {
	// 				this.errors.length = 0
	// 				this.errors.push('unsat');
	// 				this.formalismErrorFlag = false;
	// 			}
	// 			this.closeDetails();
	// 		})
	// 	}
	// }

	generateSystemBehaviours() {
		var allRequirements = this.functionalRequirements.split('\n').join("//")
		this.pfService.getProblemDiagram(allRequirements, this.ontologyFilePath, this.index).subscribe(result => {
			this.phenomena = result.phenomena;
			this.referencePhenomena = result.referencePhenomena
			this.ovals = result.ovals
			this.rects = result.rectsWithSensors
			this.lines = result.linesWithSensors
			this.rectsWithSensors = result.rectsWithSensors
			this.linesWithSensors = result.linesWithSensors
			this.change_Menu("problemdiagram")
			this.showProblemDiagram(this.rectsWithSensors, this.ovals, this.linesWithSensors)
			this.problemDiagramFlag = true;
			this.closeDetails();
			this.generateService.transform(allRequirements, this.ontologyFilePath, 'SystemBehaviour', this.index).subscribe(result2 => {
				this.rules = result2;
				document.getElementById("systembehaviours").style.display = 'block';
				var triggerLists: Array<Array<string>>
				var actionLists: Array<Array<string>>
				var times: Array<string>
				var expectations: Array<string>
				triggerLists = new Array<Array<string>>()
				actionLists = new Array<Array<string>>()
				times = new Array<string>()
				expectations = new Array<string>()
				for (var i = 0; i < this.ifThenRequirements.length; i++) {
					var ifThenRequirement = this.ifThenRequirements[i]
					triggerLists.push(ifThenRequirement.triggerList)
					actionLists.push(ifThenRequirement.actionList)
					times.push(ifThenRequirement.time)
					expectations.push(ifThenRequirement.expectation)
				}
				this.change_Menu('systembehaviours')
				this.pfService.getSbSCD(triggerLists, actionLists, times, expectations, this.ontologyFilePath).subscribe(result4 => {
					this.sbSCDPath = result4.sbPath;
					this.showSbSCD()
					this.closeDetails();
				})
			})
		})
	}

	generateSrSCD() {
		var requirements: string = ''
		for (var i = 0; i < this.requirementTexts.split('\n').length; i++) {
			var requirement: string = this.requirementTexts.split('\n')[i];
			if (requirement.trim() !== '') {
				requirements = requirements + requirement;
				if (i !== this.requirementTexts.split('\n').length - 1) requirements = requirements + '//'
			}
		}
		this.pfService.getSrSCD(requirements, this.ontologyFilePath).subscribe(result => {
			this.srSCDPath = result.srPath;
			this.showSrSCD()
			document.getElementById("scenario").style.display = 'block';
			this.change_Menu('scenario')
			this.closeDetails();
		})
	}

	generateDrSCD() {
		var triggerLists: Array<Array<string>>
		var actionLists: Array<Array<string>>
		var times: Array<string>
		var expectations: Array<string>
		triggerLists = new Array<Array<string>>()
		actionLists = new Array<Array<string>>()
		times = new Array<string>()
		expectations = new Array<string>()
		for (var i = 0; i < this.ifThenRequirements.length; i++) {
			var ifThenRequirement = this.ifThenRequirements[i]
			triggerLists.push(ifThenRequirement.triggerList)
			actionLists.push(ifThenRequirement.actionList)
			times.push(ifThenRequirement.time)
			expectations.push(ifThenRequirement.expectation)
		}
		this.pfService.getDrSCD(triggerLists, actionLists, times, expectations, this.ontologyFilePath).subscribe(result => {
			this.drSCDPath = result.drPath;
			this.showDrSCD()
			document.getElementById("scenario").style.display = 'block';
			this.change_Menu('scenario')
			this.closeDetails();
		})
	}

	generateSbSCD() {
		var triggerLists: Array<Array<string>>
		var actionLists: Array<Array<string>>
		var times: Array<string>
		var expectations: Array<string>
		triggerLists = new Array<Array<string>>()
		actionLists = new Array<Array<string>>()
		times = new Array<string>()
		expectations = new Array<string>()
		for (var i = 0; i < this.ifThenRequirements.length; i++) {
			var ifThenRequirement = this.ifThenRequirements[i]
			triggerLists.push(ifThenRequirement.triggerList)
			actionLists.push(ifThenRequirement.actionList)
			times.push(ifThenRequirement.time)
			expectations.push(ifThenRequirement.expectation)
		}
		this.pfService.getSbSCD(triggerLists, actionLists, times, expectations, this.ontologyFilePath).subscribe(result => {
			this.sbSCDPath = result.sbPath;
			this.showSbSCD()
			document.getElementById("scenario").style.display = 'block';
			this.change_Menu('scenario')
			this.closeDetails();
		})
	}

	showSrSCD() {
		var path = this.srSCDPath.trim();
		var time = (new Date()).getTime();
		var url = `http://localhost:8081/api/display?fileName=${path.trim()}&time=${time}`;
		// var url = `http://47.52.116.116:8081/api/display?fileName=${path.trim()}&time=${time}`;
		this.srImgURL = url;
	}

	showDrSCD() {
		var path = this.drSCDPath.trim();
		var time = (new Date()).getTime();
		var url = `http://localhost:8081/api/display?fileName=${path.trim()}&time=${time}`;
		// var url = `http://47.52.116.116:8081/api/display?fileName=${path.trim()}&time=${time}`;
		this.drImgURL = url;
	}

	showSbSCD() {
		var path = this.sbSCDPath.trim();
		var time = (new Date()).getTime();
		var url = `http://localhost:8081/api/display?fileName=${path.trim()}&time=${time}`;
		// var url = `http://47.52.116.116:8081/api/display?fileName=${path.trim()}&time=${time}`;
		this.sbImgURL = url;
	}

	generateIFTTTRules() {
		var allRequirements = this.functionalRequirements.split('\n').join("//")
		this.generateService.transform(allRequirements, this.ontologyFilePath, 'IFTTT', this.index).subscribe(result => {
			this.instructions = result;
			document.getElementById("instructions").style.display = 'block';
			this.change_Menu('instructions')
			this.closeDetails();
		})
	}

	generateDroolsRules() {
		var allRequirements = this.functionalRequirements.split('\n').join("//")
		this.generateService.transform(allRequirements, this.ontologyFilePath, 'Drools', this.index).subscribe(result => {
			this.instructions = result;
			document.getElementById("instructions").style.display = 'block';
			this.change_Menu('instructions')
			this.closeDetails();
		})
	}

	generateOnenetRules() {
		var allRequirements = this.functionalRequirements.split('\n').join("//")
		this.generateService.transform(allRequirements, this.ontologyFilePath, 'Onenet', this.index).subscribe(result => {
			this.instructions = result;
			document.getElementById("instructions").style.display = 'block';
			this.change_Menu('instructions')
			this.closeDetails();
		})
	}

	closeDetails() {
		var details = document.getElementsByClassName("detail");
		for (var i = 0; i < details.length; i++) {
			var element: any = details[i];
			element.open = false;
		}
	}

	generateSimulation() {
		var allRequirements = this.functionalRequirements.split('\n').join("//")
		alert('onenet simulation is starting')
		window.open('https://open.iot.10086.cn/app_editor/#/view?pid=372136&id=90235&is_model=0')
		this.simulationService.simulation(allRequirements, this.ontologyFilePath, this.index).subscribe(result => {

		})
	}

	monacoOnInit(editor) {
		this.editor = editor;
	}

	cancel() {
		document.getElementById("planing").style.display = 'none';
		document.getElementById("chooseScenario").style.display = 'none';
	}
}
