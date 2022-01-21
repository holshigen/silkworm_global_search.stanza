import Stanza from 'togostanza/stanza';
import { unwrapValueFromBinding } from 'togostanza/utils';
/**
 * jQueryはウェブアプリケーション側のPrimefacesと衝突するため通常はコメントアウトしておく。
 * Stanza単体で動作させる場合はコメントを外す。
 */
//import * as jquery from 'https://rcshige3.nig.ac.jp/rdf/js/jquery-3.5.1.min.js';
import * as dataTables from 'https://rcshige3.nig.ac.jp/rdf/js/jquery.dataTables.min.js';


export default class SilkwormPhenotypeSearch extends Stanza {
	async render() {
		try {

			// ローディング中くるくる表示
			var dispMsg = "<div class='loadingMsg'>Now loading</div>";
			if ($(this.root.querySelector("#loading")).length == 0) {
				$(this.root.querySelector("main")).html("<div id='loading'>" + dispMsg + "</div>");
			}

			let data1 = await this.query({
				endpoint : "https://rcshige3.nig.ac.jp/rdf/sparql/",
				template : "stanza1.rq",
			});
			let result1 = unwrapValueFromBinding(data1);

			let rq;
			if (this.params['keyword'] == '' || this.params['keyword'] == null) {
				rq = "stanza21.rq";
			} else {
				rq = "stanza22.rq";
			}

			let data2 = await this.query({
				endpoint : "https://rcshige3.nig.ac.jp/rdf/sparql/",
				template : rq,
				parameters : this.params,
			});
			let result2 = unwrapValueFromBinding(data2);

			result2.forEach(strain => {
				let urls = strain.journal.split(",");
				let linkedUrls = "";
				urls.forEach(url => {
					linkedUrls = linkedUrls + "<div><a href=\"URL\" target=\"_blank\">URL</a></div>".replace(/URL/g, url);
				});
				strain.journal = linkedUrls;
			});

			this.renderTemplate({
				template: 'stanza.html.hbs',
				parameters: {
					uri_identifier: result1[0].uri_identifier,
					uri_label: result1[0].uri_label,
					uri_isReferencedBy: result1[0].uri_isReferencedBy,
					uri_derived_from: result1[0].uri_derived_from,
					silkworm_phenotype_search: result2,
				}
			});

			// 結果テーブルにページャーを付ける
			$(this.root.querySelector('#resultTable')).dataTable({
				// "aLengthMenu" : [ 10, 25, 50, 100 ], // 表示件数の選択肢
				// "iDisplayLength" : 10, // 表示件数のデフォルトの値
				"ordering" : true,			// ソート
				"searching" : false,		// 検索
				"oLanguage" : {				// 表示される文字
				  "sEmptyTable" : "No data found.",
				  "sZeroRecords" : "No data found.",
				},
				"info": true,				// 件数
				"dom": '<"top"<"information"i><"pagination"p><"length_changing"l>>rt<"bottom"<"pagination"p>><"clear">',	// 表示項目位置
			});

			// URI表示チェックボックス
			const checkboxElement = this.root.querySelector("#checkbox");
			checkboxElement.addEventListener('change', e => {
				if (e.target.checked) {
					this.root.querySelector("#uri1").style.display = "";
					this.root.querySelector("#uri2").style.display = "";
					this.root.querySelector("#uri3").style.display = "";
					this.root.querySelector("#uri4").style.display = "";
				} else {
					this.root.querySelector("#uri1").style.display = "none";
					this.root.querySelector("#uri2").style.display = "none";
					this.root.querySelector("#uri3").style.display = "none";
					this.root.querySelector("#uri4").style.display = "none";
				}
			});

			// ローディング中くるくる表示削除
			$(this.root.querySelector("#loading")).remove();

		} catch (e) {
			console.log(e);
		}
	}
}
