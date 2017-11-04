(function($){
	var labels = [],
			votes = [];
	
	// adding the values from database
	pollOptions.forEach(currentValue => {
		labels.push(currentValue.name);
		
		votes.push(currentValue.votes);
	});
	
	// chart (had to use getelementbyid because selecting it with jquery isn't valid)
	var ctx = document.getElementById('poll-chart').getContext('2d'),
			pollChart = new Chart(ctx, {
				type: 'doughnut',
				data: {
						datasets: [{
							data: votes,
							backgroundColor: chartColors
						}],
						labels: labels
				}
			});

	// select option
	$('#dropdown-content li').on('click', function() {
		let optionText = $(this).text();
		
		$('#chosen-option').val(optionText);
	});
})(jQuery);